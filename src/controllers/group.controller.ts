import Group, { IGroup } from '../models/Group';

export class GroupController {
  async create(group: IGroup): Promise<IGroup> {
    const newGroup = new Group({ ...group });
    const res = await newGroup.save();
    return res;
  }

  async getById(groupId: number): Promise<IGroup | null> {
    const group = await Group.findOne({ groupId }).populate('subGroups');
    return group;
  }
}
