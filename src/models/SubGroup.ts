import * as mongoose from 'mongoose';

export interface ISubGroup {
  _id?: mongoose.Types.ObjectId;
  subGroupId: number; // id
  subGroupName: string; // Название
}

const schema = new mongoose.Schema<ISubGroup>({
  subGroupId: { type: Number, required: true },
  subGroupName: { type: String, required: true },
});

export default mongoose.model<ISubGroup>('SubGroup', schema);
