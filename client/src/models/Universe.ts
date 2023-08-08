import { Schema } from 'mongoose';

export interface Universe {
  _id: Schema.Types.ObjectId;
  name: string;
  franchises: Schema.Types.ObjectId[];
}
