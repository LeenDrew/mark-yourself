import SubGroup, { ISubGroup } from '../models/SubGroup';

// export const createOne = async (subGroup: ISubGroup): Promise<ISubGroup | null> => {
//   const sub = new SubGroup({ ...subGroup });
//   const res = await sub.save();
//   return res;
// };

export const createMany = async (subGroups: ISubGroup[]): Promise<ISubGroup[] | null> => {
  const res = await SubGroup.insertMany(subGroups);
  return res;
};

export const getManyByGroupName = async (groupName: string): Promise<ISubGroup[] | null> => {
  const groupNameRegExp = RegExp(`^${groupName}`, 'i');
  const subGroups = await SubGroup.find({ name: groupNameRegExp });
  return subGroups;
};
