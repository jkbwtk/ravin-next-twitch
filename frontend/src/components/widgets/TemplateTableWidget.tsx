import { createResource, createSignal, ErrorBoundary, For, onCleanup, onMount, Suspense } from 'solid-js';
import { useSocket } from '#providers/SocketProvider';
import { makeRequest } from '#lib/fetch';
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
import { GetTemplatesPaginatedResponse, Template as TemplateType } from '#shared/types/api/templates';
import Template from '#components/Template';
import { createPagination, getSearchParams, Pagination } from '#lib/pagination';
import Paginator from '#components/Paginator';

import style from '#styles/widgets/CommandTableWidget.module.scss';


export interface TemplateTableProps {
  openEditor: (template: TemplateType | null) => void;
  deleteTemplate: (template: TemplateType) => void;
}

const fetchTemplates = async (pagination: Pagination) => {
  const response = await makeRequest('/api/v1/templates', {
    schema: GetTemplatesPaginatedResponse,
    params: getSearchParams(pagination),
  });


  response.data.sort((a, b) => {
    if (a.id < b.id) return -1;
    if (a.id > b.id) return 1;
    return 0;
  });

  return response;
};

const TemplateTableWidget: Component<TemplateTableProps> = (props) => {
  const [socket] = useSocket();
  const [page, setPage] = createSignal(0);
  const [limit, setLimit] = createSignal(5);
  const [templates, { mutate: setTemplates, refetch: refetchTemplates }] = createResource(createPagination(limit, page), fetchTemplates, {
    initialValue: {
      data: [],
      total: 0,
      limit: 0,
      offset: 0,
    },
    name: 'templates',
  });

  let tableRef = document.createElement('table');

  const createTemplate = (template: TemplateType) => {
    setTemplates((templates) => ({ ...templates, data: [...templates.data, template] }));
  };

  const updateTemplate = (template: TemplateType) => {
    setTemplates((templates) => ({ ...templates, data: templates.data.map((c) => c.id === template.id ? template : c) }));
  };

  const removeTemplate = (templateId: number) => {
    setTemplates((templates) => ({ ...templates, data: templates.data.filter((template) => template.id !== templateId) }));
  };

  onMount(() => {
    socket.client.on('NEW_TEMPLATE', createTemplate);
    socket.client.on('UPD_TEMPLATE', updateTemplate);
    socket.client.on('DEL_TEMPLATE', removeTemplate);
  });

  onCleanup(() => {
    socket.client.off('NEW_TEMPLATE', createTemplate);
    socket.client.off('UPD_TEMPLATE', updateTemplate);
    socket.client.off('DEL_TEMPLATE', removeTemplate);
  });


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
        <Paginator page={[page, setPage]} limit={[limit, setLimit]} total={() => templates().total} />

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
                <For each={templates().data}>
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
