import { 분 } from './constants';

export const fill2 = (n: number) => `0${n}`.substr(-2);

export const parseHnM = (current: number) => {
  const date = new Date(current);
  return `${fill2(date.getHours())}:${fill2(date.getMinutes())}`;
};

const getTimeRange = (value: string): number[] => {
  const [start, end] = value.split('~').map(Number);
  if (end === undefined) return [start];
  return Array(end - start + 1)
    .fill(start)
    .map((v, k) => v + k);
};

export const parseSchedule = (schedule: string) => {
  const schedules = schedule.split('<p>');
  return schedules.map((schedule) => {
    const reg = /^([가-힣])(\d+(~\d+)?)(.*)/;

    const [day] = schedule.split(/(\d+)/);

    const range = getTimeRange(schedule.replace(reg, '$2'));

    const room = schedule.replace(reg, '$4')?.replace(/\(|\)/g, '');

    return { day, range, room };
  });
};

export const generateTimes = () =>
  [
    ...Array(18)
      .fill(0)
      .map((v, k) => v + k * 30 * 분)
      .map((v) => `${parseHnM(v)}~${parseHnM(v + 30 * 분)}`),

    ...Array(6)
      .fill(18 * 30 * 분)
      .map((v, k) => v + k * 55 * 분)
      .map((v) => `${parseHnM(v)}~${parseHnM(v + 50 * 분)}`),
  ] as const;
