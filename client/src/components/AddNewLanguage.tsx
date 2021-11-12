import React from 'react';
import axios from 'axios';
import * as yup from 'yup';
import { useFormik } from 'formik';
import { API_URL } from '../config';
import { Button, TextField } from '@mui/material';

const validationSchema = yup.object({
  name: yup
      .string()
      .required('Name is required'),
  code: yup
      .string()
      .required('Code is required')
});


export const AddNewLanguage = () => {
  const formik = useFormik({
    initialValues: {
      name: '',
      code: ''
    },
    validationSchema: validationSchema,
    onSubmit: () => {
      console.log(formik.values);
      axios.post(`${API_URL}/language`, {
        name: formik.values.name,
        code: formik.values.code,
        movies: []
      })
          .then(function(response) {
          })
          .catch(function(response) {
            console.log(response);
          });
    }
  });
  return (
    <div className="main-container">
      <form id="form" onSubmit={formik.handleSubmit} autoComplete="off">
        <TextField
          id="name"
          name="name"
          label="Name"
          value={formik.values.name}
          onChange={formik.handleChange}
          error={formik.touched.name && Boolean(formik.errors.name)}
          helperText={formik.touched.name && formik.errors.name}
        />
        <TextField
          id="code"
          name="code"
          label="Code"
          value={formik.values.code}
          onChange={formik.handleChange}
          error={formik.touched.code && Boolean(formik.errors.code)}
          helperText={formik.touched.code && formik.errors.code}
        />
        <Button color="primary" variant="contained" type="submit">
          Submit
        </Button>

      </form>
    </div>
  );
};
