import dayjs from 'dayjs';
import * as universityFetch from '../helpers/univ.api';
import { ISubGroup } from '../models/SubGroup';

/**
 * Получение массива подгрупп по группе
 * @param {number} groupId
 * @param {string} groupName
 * @returns {Promise<ISubGroup[]>} subGroups
 */
export const getSubGroups = async (groupId: number, groupName: string): Promise<ISubGroup[]> => {
  const startDate = dayjs().format('YYYY.MM.DD');
  const endDate = dayjs(startDate).add(1, 'month').format('YYYY.MM.DD');

  const res = await universityFetch.getSheduleByGroupId(groupId, startDate, endDate);

  if (res.status !== 200) {
    throw new Error('Что-то пошло не так');
  }

  const subGroups: ISubGroup[] = [];

  const groupNameRegExp = RegExp(`^${groupName}`, 'i');

  res.data.forEach((el) => {
    if (
      el.subGroup &&
      groupNameRegExp.test(el.subGroup) &&
      !subGroups.find((e) => e.subGroupId === el.subGroupOid)
    ) {
      subGroups.push({ subGroupId: el.subGroupOid, subGroupName: el.subGroup });
    }
  });

  return subGroups;
};
