import SubGroupModel, { SubGroup } from '../models/SubGroup';

export class SubGroupController {
  createMany = async (subgroups: SubGroup[]): Promise<SubGroup[]> => {
    const res = await SubGroupModel.insertMany(subgroups);
    return res;
  };

  createOne = async (subgroup: SubGroup): Promise<SubGroup> => {
    const res = await SubGroupModel.insertMany(subgroup);
    return res;
  };

  getManyByGroupName = async (groupName: string): Promise<SubGroup[]> => {
    const groupNameRegExp = RegExp(`^${groupName}`, 'i');
    const subGroups = await SubGroupModel.find({ subGroupName: groupNameRegExp });
    return subGroups;
  };
}
