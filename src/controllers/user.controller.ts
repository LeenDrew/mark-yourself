import * as mongoose from 'mongoose';
import User, { IUser, UserRole } from '../models/User';

export class UserController {
  async create(candidate: IUser): Promise<IUser> {
    const user = new User({ ...candidate });
    const res = await user.save();
    return res;
  }

  async isExist(vkId: number): Promise<boolean> {
    const check = await User.count({ vkId });
    if (check) return true;
    return false;
  }

  async getByVkId(vkId: number): Promise<IUser | null> {
    const user = await User.findOne({ vkId }).populate('group subGroup');
    return user;
  }

  async getGroupLeaderByGroupId(groupId: number): Promise<IUser | null> {
    const user = await User.findOne({ groupId })
      .populate('group')
      .findOne({ role: UserRole.LEADER });
    return user;
  }

  async updateGroup(
    vkId: number,
    groupUid: mongoose.Types.ObjectId,
    subGroupUid: mongoose.Types.ObjectId,
  ): Promise<mongoose.UpdateWriteOpResult> {
    const res = await User.updateOne(
      { vkId },
      { $set: { group: groupUid, subGroup: subGroupUid } },
    );
    return res;
  }

  async updateSubGroup(
    vkId: number,
    subGroupUid: mongoose.Types.ObjectId,
  ): Promise<mongoose.UpdateWriteOpResult> {
    const res = await User.updateOne({ vkId }, { $set: { subGroup: subGroupUid } });
    return res;
  }

  async remove(vkId: number): Promise<void> {
    await User.deleteOne({ vkId });
  }
}
