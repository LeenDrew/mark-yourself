import axios, { AxiosResponse } from 'axios';

enum SearchType {
  GROUP = 'group',
  PERSON = 'person',
}

interface SearchData {
  id: number;
  label: string;
  type: SearchType;
}

interface ISheduleData {
  beginLesson: string; // Время начала ЧЧ:ММ
  endLesson: string; // Время конца ЧЧ:ММ
  date: string; // ГГГГ.ММ.ДД
  dayOfWeek: number; // 1 - пн и тд.
  dayOfWeekString: string; // ПН и тд.

  discipline: string; // Название
  disciplineOid: number; // id предмета (военка 5607)
  kindOfWork: string; // Лекция, ЛР, ПЗ
  kindOfWorkOid: number; // 2 - лекции, 3 - ЛР, 4 - ПЗ

  group: string | null; // Название группы или null, если лекция
  groupOid: number | 0; // id группы или 0, если лекция. ИСТ-191 - 452
  subGroup: string | null;
  subGroupOid: number | 0; // ИСТ-191/1 - 1354, ИСТ-191/2 - 1355

  stream: string; // Название потока для лекций. Поток(ИСТ-191, ИСТ-192, ПИ-191, ПИ-192)
}

export const searchByGroup = async (group: string): Promise<AxiosResponse<SearchData[]>> => {
  const res = await axios.get<SearchData[]>('https://rasp.omgtu.ru/api/search', {
    params: { term: group, type: SearchType.GROUP },
  });
  return res;
};

export const getSheduleByGroupId = async (
  groupId: number,
  startDay: string,
  finishDay: string,
): Promise<AxiosResponse<ISheduleData[]>> => {
  const res = await axios.get<ISheduleData[]>(
    `https://rasp.omgtu.ru/api/schedule/group/${groupId}`,
    {
      params: { start: startDay, finish: finishDay },
    },
  );
  return res;
};
