import React from 'react';
import { useFormik } from 'formik';
import axiosConfig from '../../helper/axiosConfig';
import { languageValidationSchema as validationSchema } from '../../helper/validationScehmas';
import { ADD_NEW_LANGUAGE_URL } from '../../helper/config';
import { Box, Button, TextField, FormControl } from '../lib';

export const AddNewLanguage = () => {
  const formik = useFormik({
    initialValues: {
      name: '',
      code: ''
    },
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      console.log(formik.values);
      axiosConfig.post(`${ADD_NEW_LANGUAGE_URL}`, {
        name: formik.values.name,
        code: formik.values.code,
        movies: []
      })
          .then(function(response) {
            resetForm();
          })
          .catch(function(response) {
            console.log(response);
          });
    }
  });
  return (
    <form id="form" onSubmit={formik.handleSubmit} autoComplete="off">
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <FormControl sx={{ m: 2, width: 300 }}>
          <TextField
            id="name"
            name="name"
            label="Name"
            value={formik.values.name}
            onChange={formik.handleChange}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
        </FormControl>
        <FormControl sx={{ m: 2, width: 300 }}>
          <TextField
            id="code"
            name="code"
            label="Code"
            value={formik.values.code}
            onChange={formik.handleChange}
            error={formik.touched.code && Boolean(formik.errors.code)}
            helperText={formik.touched.code && formik.errors.code}
          />
        </FormControl>
        <Button color="primary" variant="contained" type="submit">
          Submit
        </Button>
      </Box>
    </form>
  );
};
