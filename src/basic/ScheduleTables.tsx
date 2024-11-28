import { Flex, Stack } from '@chakra-ui/react';
import { ScheduleTable } from './ScheduleTable.tsx';
import { useScheduleContext } from './ScheduleContext.tsx';
import SearchDialog from './SearchDialog.tsx';
import { useState, useMemo, useCallback } from 'react';
import { memo } from 'react';
import { useDndMonitor } from '@dnd-kit/core';
import TableHeader from './components/TableHeader';

export const ScheduleTables = () => {
  const [searchInfo, setSearchInfo] = useState<{
    tableId: string;
    day?: string;
    time?: number;
  } | null>(null);

  const handleSearchInfoChange = useCallback(
    (info: { tableId: string; day?: string; time?: number } | null) => {
      setSearchInfo(() => info);
    },
    []
  );

  return (
    <>
      <TableContainer onSearchInfoChange={handleSearchInfoChange} />
      <SearchDialog searchInfo={searchInfo} onClose={() => handleSearchInfoChange(null)} />
    </>
  );
};

type TableContainerProps = {
  onSearchInfoChange: (info: { tableId: string; day?: string; time?: number } | null) => void;
};

const TableContainer = ({ onSearchInfoChange }: TableContainerProps) => {
  const { schedulesMap } = useScheduleContext();
  const tableIds = useMemo(() => Object.keys(schedulesMap), [schedulesMap]);

  const disabledRemoveButton = tableIds.length === 1;

  return (
    <Flex w="full" gap={6} p={6} flexWrap="wrap">
      {tableIds.map((tableId, index) => (
        <TableWrapper
          key={tableId}
          tableId={tableId}
          index={index}
          disabledRemoveButton={disabledRemoveButton}
          onSearchClick={() => onSearchInfoChange({ tableId })}
          onScheduleTimeClick={(timeInfo) => onSearchInfoChange({ tableId, ...timeInfo })}
        />
      ))}
    </Flex>
  );
};

const TableWrapper = memo(function TableWrapper({
  tableId,
  index,
  disabledRemoveButton,
  onSearchClick,
  onScheduleTimeClick,
}: {
  tableId: string;
  index: number;
  disabledRemoveButton: boolean;
  onSearchClick: () => void;
  onScheduleTimeClick: (timeInfo: { day: string; time: number }) => void;
}) {
  const [activeDragTableId, setActiveDragTableId] = useState<string | null>(null);

  const { handleDuplicate, handleRemove, updateSchedule, getSchedules } = useScheduleContext();

  const schedules = useMemo(() => getSchedules(tableId), [getSchedules, tableId]);

  useDndMonitor({
    onDragStart(event) {
      const [activeTableId] = (event.active.id as string).split(':');
      if (activeTableId !== tableId) return;
      setActiveDragTableId(activeTableId);
    },
    onDragEnd(event) {
      const [activeTableId] = (event.active.id as string).split(':');
      if (activeTableId !== tableId) return;
      updateSchedule(event);
      setActiveDragTableId(null);
    },
  });

  return (
    <Stack key={tableId} width="600px">
      <TableHeader
        index={index}
        tableId={tableId}
        disabledRemoveButton={disabledRemoveButton}
        onSearchClick={onSearchClick}
        onDuplicateClick={() => handleDuplicate(tableId)}
        onRemoveClick={() => handleRemove(tableId)}
      />
      <ScheduleTable
        schedules={schedules}
        activeDragTableId={activeDragTableId}
        tableId={tableId}
        onScheduleTimeClick={onScheduleTimeClick}
      />
    </Stack>
  );
});
