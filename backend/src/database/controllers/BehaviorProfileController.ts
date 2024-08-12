import { db } from '#database/database';
import { convertToControllerProxy, createSecurityMethods, createSharedMethods, SelectOptions } from '#database/utils';
import {
  behaviorProfilesTable,
  behaviorProfilesToCommandsTable,
  behaviorProfilesToCommandTimersTable,
  behaviorProfilesToPhraseFiltersTable,
  behaviorProfilesToRegexFiltersTable,
} from '#schema/schema';
import {
  BehaviorProfile,
  BehaviorProfileWithRelatedIds,
  BehaviorProfileWithRelations,
  BehaviorProfileWithRelationsCreate,
  BehaviorProfileWithRelationsUpdate,
  Command,
  CommandTimer,
  PhraseFilter,
  RegexFilter,
} from '#types/database/tables';
import { and, asc, count, desc, eq, inArray, SQL } from 'drizzle-orm';


type BehaviorProfileWithUnmappedRelations = BehaviorProfile & {
  commands: { command: Command }[];
  phraseFilters: { phraseFilter: PhraseFilter }[];
  regexFilters: { regexFilter: RegexFilter }[];
  commandTimers: { commandTimer: CommandTimer }[];
};

function mapRelations(profile: BehaviorProfileWithUnmappedRelations): BehaviorProfileWithRelations {
  return {
    ...profile,
    commands: profile.commands.map(({ command }) => command),
    phraseFilters: profile.phraseFilters.map(({ phraseFilter }) => phraseFilter),
    regexFilters: profile.regexFilters.map(({ regexFilter }) => regexFilter),
    commandTimers: profile.commandTimers.map(({ commandTimer }) => commandTimer),
  };
}

const sharedMethods = createSharedMethods(behaviorProfilesTable);

const BehaviorProfileControllerMethods = {
  ...sharedMethods as Omit<typeof sharedMethods, 'create' | 'update'>,
  ...createSecurityMethods(behaviorProfilesTable),

  async getByIdWithRelations(id: number): Promise<BehaviorProfileWithRelations | null> {
    const query = db
      .query
      .behaviorProfilesTable
      .findFirst({
        where: eq(behaviorProfilesTable.id, id),

        with: {
          commands: {
            with: {
              command: true,
            },
          },
          phraseFilters: {
            with: {
              phraseFilter: true,
            },
          },
          regexFilters: {
            with: {
              regexFilter: true,
            },
          },
          commandTimers: {
            with: {
              commandTimer: true,
            },
          },
        },
      });

    const result = await query;

    if (!result) {
      return null;
    }

    return mapRelations(result);
  },

  async getByUserId(userId: string, options: SelectOptions = {}): Promise<BehaviorProfile[]> {
    const filters: SQL[] = [
      eq(behaviorProfilesTable.channelUserId, userId),
    ];

    const orderBy: SQL[] = [];

    if (options.idListFilter) {
      filters.push(inArray(behaviorProfilesTable.id, options.idListFilter.id.in));
    }

    if (options.orderBy) {
      for (const [column, direction] of Object.entries(options.orderBy)) {
        const method = direction === 'asc' ? asc : desc;
        orderBy.push(method(behaviorProfilesTable[column as keyof BehaviorProfile]));
      }
    }

    const query = db
      .query
      .behaviorProfilesTable
      .findMany({
        where: and(...filters),
        orderBy,

        ...options.pagination,
      });

    const result = await query;

    return result;
  },

  async countByUserId(userId: string): Promise<number> {
    const query = db
      .select({ count: count() })
      .from(behaviorProfilesTable)
      .where(eq(behaviorProfilesTable.channelUserId, userId));

    const result = await query;

    return result.at(0)?.count ?? 0;
  },

  async getByUserIdWithRelations(userId: string, options: SelectOptions = {}): Promise<BehaviorProfileWithRelations[]> {
    const filters: SQL[] = [
      eq(behaviorProfilesTable.channelUserId, userId),
    ];

    const orderBy: SQL[] = [];

    if (options.idListFilter) {
      filters.push(inArray(behaviorProfilesTable.id, options.idListFilter.id.in));
    }

    if (options.orderBy) {
      for (const [column, direction] of Object.entries(options.orderBy)) {
        const method = direction === 'asc' ? asc : desc;
        orderBy.push(method(behaviorProfilesTable[column as keyof BehaviorProfile]));
      }
    }

    const query = db
      .query
      .behaviorProfilesTable
      .findMany({
        where: and(...filters),
        orderBy,

        with: {
          commands: {
            with: {
              command: true,
            },
          },
          phraseFilters: {
            with: {
              phraseFilter: true,
            },
          },
          regexFilters: {
            with: {
              regexFilter: true,
            },
          },
          commandTimers: {
            with: {
              commandTimer: true,
            },
          },
        },

        ...options.pagination,
      });

    const result = await query;

    return result.map(mapRelations);
  },

  async createWithRelations(profile: BehaviorProfileWithRelationsCreate): Promise<BehaviorProfileWithRelations | null> {
    const createdProfile = await db.transaction(async (tx) => {
      const createProfileQuery = tx
        .insert(behaviorProfilesTable)
        .values(profile)
        .returning({ id: behaviorProfilesTable.id });

      const createdProfile = (await createProfileQuery).at(0) ?? null;

      if (createdProfile === null) {
        tx.rollback();
        throw new Error('Failed to create profile');
      }

      const m2mQueries: Promise<unknown>[] = [];

      if (profile.commands.length > 0) {
        m2mQueries.push(
          tx
            .insert(behaviorProfilesToCommandsTable)
            .values(profile.commands.map((commandId) => ({
              behaviorProfileId: createdProfile.id,
              commandId: commandId,
            }))),
        );
      }

      if (profile.phraseFilters.length > 0) {
        m2mQueries.push(
          tx
            .insert(behaviorProfilesToPhraseFiltersTable)
            .values(profile.phraseFilters.map((phraseFilterId) => ({
              behaviorProfileId: createdProfile.id,
              phraseFilterId: phraseFilterId,
            }))),
        );
      }

      if (profile.regexFilters.length > 0) {
        m2mQueries.push(
          tx
            .insert(behaviorProfilesToRegexFiltersTable)
            .values(profile.regexFilters.map((regexFilterId) => ({
              behaviorProfileId: createdProfile.id,
              regexFilterId: regexFilterId,
            }))),
        );
      }

      if (profile.commandTimers.length > 0) {
        m2mQueries.push(
          tx
            .insert(behaviorProfilesToCommandTimersTable)
            .values(profile.commandTimers.map((commandTimerId) => ({
              behaviorProfileId: createdProfile.id,
              commandTimerId: commandTimerId,
            }))),
        );
      }

      await Promise.all(m2mQueries);

      return createdProfile;
    });

    const result = await BehaviorProfileControllerMethods.getByIdWithRelations(createdProfile.id);

    return result;
  },

  async updateWithRelations(profile: BehaviorProfileWithRelationsUpdate): Promise<BehaviorProfileWithRelations | null> {
    const updatedProfile = await db.transaction(async (tx) => {
      const updateProfileQuery = tx
        .update(behaviorProfilesTable)
        .set(profile)
        .where(eq(behaviorProfilesTable.id, profile.id))
        .returning({ id: behaviorProfilesTable.id });

      const updatedProfile = (await updateProfileQuery).at(0) ?? null;

      if (updatedProfile === null) {
        tx.rollback();
        throw new Error('Failed to update profile');
      }

      const m2mDeleteQueries: Promise<unknown>[] = [];

      if (profile.commands !== undefined) {
        m2mDeleteQueries.push(
          tx
            .delete(behaviorProfilesToCommandsTable)
            .where(eq(behaviorProfilesToCommandsTable.behaviorProfileId, profile.id)),
        );
      }

      if (profile.phraseFilters !== undefined) {
        m2mDeleteQueries.push(
          tx
            .delete(behaviorProfilesToPhraseFiltersTable)
            .where(eq(behaviorProfilesToPhraseFiltersTable.behaviorProfileId, profile.id)),
        );
      }

      if (profile.regexFilters !== undefined) {
        m2mDeleteQueries.push(
          tx
            .delete(behaviorProfilesToRegexFiltersTable)
            .where(eq(behaviorProfilesToRegexFiltersTable.behaviorProfileId, profile.id)),
        );
      }

      if (profile.commandTimers !== undefined) {
        m2mDeleteQueries.push(
          tx
            .delete(behaviorProfilesToCommandTimersTable)
            .where(eq(behaviorProfilesToCommandTimersTable.behaviorProfileId, profile.id)),
        );
      }

      await Promise.all(m2mDeleteQueries);

      const m2mCreteQueries: Promise<unknown>[] = [];


      if (profile.commands !== undefined && profile.commands.length > 0) {
        m2mCreteQueries.push(
          tx
            .insert(behaviorProfilesToCommandsTable)
            .values(profile.commands.map((commandId) => ({
              behaviorProfileId: profile.id,
              commandId: commandId,
            }))),
        );
      }

      if (profile.phraseFilters !== undefined && profile.phraseFilters.length > 0) {
        m2mCreteQueries.push(
          tx
            .insert(behaviorProfilesToPhraseFiltersTable)
            .values(profile.phraseFilters.map((phraseFilterId) => ({
              behaviorProfileId: profile.id,
              phraseFilterId: phraseFilterId,
            }))),
        );
      }

      if (profile.regexFilters !== undefined && profile.regexFilters.length > 0) {
        m2mCreteQueries.push(
          tx
            .insert(behaviorProfilesToRegexFiltersTable)
            .values(profile.regexFilters.map((regexFilterId) => ({
              behaviorProfileId: profile.id,
              regexFilterId: regexFilterId,
            }))),
        );
      }

      if (profile.commandTimers !== undefined && profile.commandTimers.length > 0) {
        m2mCreteQueries.push(
          tx
            .insert(behaviorProfilesToCommandTimersTable)
            .values(profile.commandTimers.map((commandTimerId) => ({
              behaviorProfileId: profile.id,
              commandTimerId: commandTimerId,
            }))),
        );
      }

      await Promise.all(m2mCreteQueries);

      return updatedProfile;
    });

    const response = await BehaviorProfileControllerMethods.getByIdWithRelations(updatedProfile.id);

    return response;
  },
};

const BehaviorProfileProperties = {
  $utils: {
    mapToRelatedIds(profile: BehaviorProfileWithRelations): BehaviorProfileWithRelatedIds {
      return {
        ...profile,
        commandIds: profile.commands.map((command) => command.id),
        phraseFilterIds: profile.phraseFilters.map((phraseFilter) => phraseFilter.id),
        regexFilterIds: profile.regexFilters.map((regexFilter) => regexFilter.id),
        commandTimerIds: profile.commandTimers.map((commandTimer) => commandTimer.id),
      };
    },
  },
};

export const BehaviorProfileController = convertToControllerProxy('BehaviorProfile', BehaviorProfileControllerMethods, BehaviorProfileProperties);
