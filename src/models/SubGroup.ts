import * as mongoose from 'mongoose';

export interface SubGroup {
  _id?: mongoose.Types.ObjectId;
  subGroupId: number; // id
  subGroupName: string; // Название
}

const schema = new mongoose.Schema<SubGroup>({
  subGroupId: { type: Number, required: true },
  subGroupName: { type: String, required: true },
});

export default mongoose.model<SubGroup>('SubGroup', schema);
