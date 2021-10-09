import * as mongoose from 'mongoose';
import UserModel, { User, UserRole } from '../models/User';

export class UserController {
  async create(candidate: User): Promise<User> {
    const user = new UserModel({ ...candidate });
    const res = await user.save();
    return res;
  }

  async isExist(vkId: number): Promise<boolean> {
    const check = await UserModel.count({ vkId });
    if (check) return true;
    return false;
  }

  async getByVkId(vkId: number): Promise<User | null> {
    const user = await UserModel.findOne({ vkId }).populate('group subGroup');
    return user;
  }

  async getGroupLeaderByGroupId(groupId: number): Promise<User | null> {
    const user = await UserModel.findOne({ groupId })
      .populate('group')
      .findOne({ role: UserRole.LEADER });
    return user;
  }

  async updateGroup(
    vkId: number,
    groupUid: mongoose.Types.ObjectId,
    subGroupUid: mongoose.Types.ObjectId,
  ): Promise<mongoose.UpdateWriteOpResult> {
    const res = await UserModel.updateOne(
      { vkId },
      { $set: { group: groupUid, subGroup: subGroupUid } },
    );
    return res;
  }

  async updateSubGroup(
    vkId: number,
    subGroupUid: mongoose.Types.ObjectId,
  ): Promise<mongoose.UpdateWriteOpResult> {
    const res = await UserModel.updateOne({ vkId }, { $set: { subGroup: subGroupUid } });
    return res;
  }

  async remove(vkId: number): Promise<void> {
    await UserModel.deleteOne({ vkId });
  }
}
