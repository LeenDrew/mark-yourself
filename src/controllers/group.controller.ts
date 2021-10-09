import GroupModel, { Group } from '../models/Group';

export class GroupController {
  async create(group: Group): Promise<Group> {
    const newGroup = new GroupModel({ ...group });
    const res = await newGroup.save();
    return res;
  }

  async getById(groupId: number): Promise<Group | null> {
    const group = await GroupModel.findOne({ groupId }).populate('subGroups');
    return group;
  }
}
