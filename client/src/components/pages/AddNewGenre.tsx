import React from 'react';
import { useFormik } from 'formik';
import axiosConfig from '../../helper/axiosConfig';
import { ADD_NEW_GENRE_URL } from '../../helper/config';
import { genreValidationSchema as validationSchema } from '../../helper/validationScehmas';
import { Box, Button, TextField, FormControl } from '../../lib';

export const AddNewGenre = () => {
  const formik = useFormik({
    initialValues: {
      name: ''
    },
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      axiosConfig.post(`${ADD_NEW_GENRE_URL}`, {
        name: formik.values.name,
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
    <form onSubmit={formik.handleSubmit}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <FormControl sx={{ m: 2, width: 300 }}>
          <TextField
            id="name"
            name="name"
            label="Genre"
            value={formik.values.name}
            onChange={formik.handleChange}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
        </FormControl>
        <Button color="primary" variant="contained" type="submit">
          Submit
        </Button>

      </Box>
    </form>
  );
};