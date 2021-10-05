import * as mongoose from 'mongoose';
import User, { IUser, UserRole } from '../models/User';

export const create = async (candidate: IUser): Promise<IUser | null> => {
  const user = new User({ ...candidate });
  const res = await user.save();
  return res;
};

export const isExist = async (vkId: number): Promise<boolean> => {
  const check = await User.findOne({ vkId });
  if (check) return true;
  return false;
};

export const getByVkId = async (vkId: number): Promise<IUser | null> => {
  const user = await User.findOne({ vkId }).populate('group subGroup');
  return user;
};

export const getGroupLeaderByGroupId = async (groupId: number): Promise<IUser | null> => {
  const user = await User.findOne({ groupId }).populate('group').findOne({ role: UserRole.LEADER });
  return user;
};

export const updateGroup = async (
  vkId: number,
  groupUid: mongoose.Types.ObjectId,
  subGroupUid: mongoose.Types.ObjectId,
): Promise<void> => {
  await User.updateOne({ vkId }, { $set: { group: groupUid, subGroup: subGroupUid } });
};

export const updateSubGroup = async (
  vkId: number,
  subGroupUid: mongoose.Types.ObjectId,
): Promise<void> => {
  await User.updateOne({ vkId }, { $set: { subGroup: subGroupUid } });
};

export const remove = async (vkId: number): Promise<void> => {
  await User.deleteOne({ vkId });
};
