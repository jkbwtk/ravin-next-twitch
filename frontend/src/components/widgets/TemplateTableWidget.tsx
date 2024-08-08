import { createSignal, ErrorBoundary, For, Suspense } from 'solid-js';
import FetchFallback from '#components/FetchFallback';
import ErrorFallback from '#components/ErrorFallback';
import Widget from '#components/Widget';
import TableContainer from '@suid/material/TableContainer/TableContainer';
import Table from '@suid/material/Table/Table';
import TableHead from '@suid/material/TableHead/TableHead';
import Paper from '@suid/material/Paper/Paper';
import TableRow from '@suid/material/TableRow/TableRow';
import TableCell from '@suid/material/TableCell/TableCell';
import TableBody from '@suid/material/TableBody/TableBody';
import { TemplateApi } from '#types/api/templates';
import Template from '#components/Template';
import Paginator from '#components/Paginator';
import { useSession } from '#providers/SessionProvider';
import { useTemplates } from '#providers/TemplatesProvider';

import style from '#styles/widgets/TableWidget.module.scss';


export interface TemplateTableProps {
  openEditor: (template: TemplateApi | null) => void;
  deleteTemplate: (template: TemplateApi) => void;
}

const TemplateTableWidget: Component<TemplateTableProps> = (props) => {
  const [session] = useSession();

  const [page, setPage] = createSignal(0);
  const [limit, setLimit] = createSignal(session.config.defaultPaginationLimit);
  const [templates, { refetchTemplates }] = useTemplates();

  let tableRef = document.createElement('table');

  const paginatedTemplates = () => {
    const start = page() * limit();
    const end = start + limit();

    return templates().slice(start, end);
  };

  return (
    <Widget
      title='Templates'
      class={style.container}
      containerClass={style.outerContainer}
      refresh={refetchTemplates}
      loading={templates.state === 'refreshing'}
    >
      <ErrorBoundary fallback={
        <ErrorFallback class={style.fallback} refresh={refetchTemplates} loading={templates.state === 'refreshing'}>Failed to load templates</ErrorFallback>
      }>
        <Paginator page={[page, setPage]} limit={[limit, setLimit]} total={() => templates().length} />

        <Suspense fallback={<FetchFallback class={style.fallback}>Fetching Templates</FetchFallback>}>
          <TableContainer class={style.commandsContainer} component={Paper}>
            <Table ref={tableRef} stickyHeader>
              <TableHead >
                <TableRow>
                  <TableCell align='center'>Name</TableCell>
                  <TableCell align='center'>Template</TableCell>
                  <TableCell align='center'>Environments</TableCell>
                  <TableCell align='center' class={style.minWidthColumn}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <For each={paginatedTemplates()}>
                  {(template) => (
                    <Template template={template} openEditor={props.openEditor} deleteTemplate={props.deleteTemplate} />
                  )}
                </For>
              </TableBody>
            </Table>
          </TableContainer>
        </Suspense>
      </ErrorBoundary>
    </Widget>
  );
};

export default TemplateTableWidget;
