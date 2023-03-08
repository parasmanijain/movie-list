import { connect } from 'mongoose';
declare var process: {
  env: {
    DATABASE_URL: string;
  };
};

export const mongoose = connect(process.env.DATABASE_URL);
