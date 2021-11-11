import React from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import axios from 'axios';
import { makeStyles } from '@mui/styles';
import { Button, TextField } from '@mui/material';
import { API_URL } from '../config';

const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      width: '50ch',
    },
  },
}));

const validationSchema = yup.object({
  name: yup
    .string()
    .required('Country is required')
});

export const AddNewCountry = () => {
  const classes = useStyles();
  const formik = useFormik({
    initialValues: {
      name: ''
    },
    validationSchema: validationSchema,
    onSubmit: () => {
      axios.post(`${API_URL}/country`, {
        name: formik.values.name
      })
        .then(function (response) {
        })
        .catch(function (response) {
          console.log(response);
        })
    },
  });
  return (
    <div className={classes.root}>
      <form onSubmit={formik.handleSubmit}>
        <TextField
          variant="outlined"
          id="name"
          name="name"
          label="Country"
          value={formik.values.name}
          onChange={formik.handleChange}
          error={formik.touched.name && Boolean(formik.errors.name)}
          helperText={formik.touched.name && formik.errors.name}
        />
        <Button color="primary" variant="contained" type="submit">
          Submit
        </Button>
      </form>
    </div>
  )
}
