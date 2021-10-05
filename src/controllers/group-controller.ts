import Group, { IGroup } from '../models/Group';

export const create = async (group: IGroup): Promise<IGroup | null> => {
  const newGroup = new Group({ ...group });
  const res = await newGroup.save();
  return res;
};

export const getById = async (groupId: number): Promise<IGroup | null> => {
  const group = await Group.findOne({ groupId }).populate('subGroups');
  return group;
};
