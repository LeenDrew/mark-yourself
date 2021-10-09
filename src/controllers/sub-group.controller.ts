import SubGroupModel, { SubGroup } from '../models/SubGroup';

export class SubGroupController {
  async createMany(subGroups: SubGroup[]): Promise<SubGroup[]> {
    const res = await SubGroupModel.insertMany(subGroups);
    return res;
  }

  async getManyByGroupName(groupName: string): Promise<SubGroup[]> {
    const groupNameRegExp = RegExp(`^${groupName}`, 'i');
    const subGroups = await SubGroupModel.find({ subGroupName: groupNameRegExp });
    return subGroups;
  }
}
