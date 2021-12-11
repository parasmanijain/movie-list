import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import axiosConfig from '../../helper/axiosConfig';
import { ADD_NEW_CATEGORY_URL, GET_AWARDS_URL, MenuProps } from '../../helper/config';
import { categoryValidationSchema as validationSchema } from '../../helper/validationScehmas';
import { Box, Button, TextField, Select, InputLabel, ListItemText, FormControl, MenuItem,
  OutlinedInput, FormHelperText } from '../../lib';

export const AddNewCategory = () => {
  const [awardData, setAwardData] = useState([]);
  const formik = useFormik({
    initialValues: {
      name: '',
      award: ''
    },
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      axiosConfig.post(`${ADD_NEW_CATEGORY_URL}`, {
        name: formik.values.name,
        award: formik.values.award ? formik.values.award : null,
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
  useEffect(() => {
    axiosConfig.get(`${GET_AWARDS_URL}`, {
    })
        .then(function(response) {
          setAwardData(response.data);
        })
        .catch(function(response) {
          console.log(response);
        });
    return () => {
      setAwardData([]);
    };
  }, []);
  return (
    <form onSubmit={formik.handleSubmit}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <FormControl sx={{ m: 2, width: 300 }}>
          <TextField
            id="name"
            name="name"
            label="Category"
            value={formik.values.name}
            onChange={formik.handleChange}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
        </FormControl>
        <FormControl sx={{ m: 2, width: 300 }}>
          <InputLabel id="award-label">Award</InputLabel>
          <Select
            labelId="award-label"
            id="award"
            name="award"
            value={formik.values.award}
            onChange={formik.handleChange}
            error={formik.touched.award && Boolean(formik.errors.award)}
            input={<OutlinedInput label="Award" />}
            MenuProps={MenuProps}
          >
            {[...awardData].map((award) => (
              <MenuItem key={award._id} value={award._id}>
                <ListItemText primary={award.name} />
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{formik.touched.award && formik.errors.award}</FormHelperText>
        </FormControl>
        <Button color="primary" variant="contained" type="submit">
          Submit
        </Button>

      </Box>
    </form>
  );
};
