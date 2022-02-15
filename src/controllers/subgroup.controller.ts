import SubGroupModel, { SubGroup } from '../models/SubGroup';

export class SubGroupController {
  createMany = async (subgroups: SubGroup[]): Promise<SubGroup[]> =>
    SubGroupModel.insertMany(subgroups);

  createOne = async (subgroup: SubGroup): Promise<SubGroup> => SubGroupModel.insertMany(subgroup);

  getManyByGroupName = async (groupName: string): Promise<SubGroup[]> =>
    SubGroupModel.find({ subGroupName: RegExp(`^${groupName}`, 'i') });
}
