import { connect } from 'mongoose';
connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true });
