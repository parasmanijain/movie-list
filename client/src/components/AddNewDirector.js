import React, {useState, useEffect} from 'react';
import axios from 'axios';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import OutlinedInput from '@material-ui/core/OutlinedInput';

const useStyles = makeStyles((theme) => ({
    root: {
        '& > *': {
          margin: theme.spacing(1)
        },
      },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

const  URL_REGEX = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;

const validationSchema = yup.object({
    name: yup
      .string('Enter the Name')
      .required('Name is required'),
    url: yup
      .string('Enter the url')
      .matches(URL_REGEX)
      .required('URL is required'),
    country: yup
      .string('Select the country')
    .required('Country is required')
  });

export const AddNewDirector = () => {
    const classes = useStyles();    
    const [countryData,setCountryData] = useState([]);
    useEffect(() => {
        axios.get('http://localhost:8000/countries', {
    })
    .then(function (response) {
        setCountryData(response.data); 
    })
    .catch(function (response) {
      console.log(response);
    })
        return () => {
            setCountryData([]);
        }
    }, []);
    const formik = useFormik({
    initialValues: {
        name: '',
        url: '',
        country: ''
    },
    validationSchema: validationSchema,
    onSubmit: () => {
        axios.post('http://localhost:8000/director', {
            name:formik.values.name,
            url:formik.values.url,            
            country:formik.values.country
        })
        .then(function (response) {
        console.log(response);
        })
        .catch(function (response) {
        console.log(response);
        })
    
    }
});
    return (
        <div className={classes.root}>
        <form onSubmit={formik.handleSubmit} id="form" autoComplete="off">
        <TextField
        variant="outlined"
          id="name"
          name="name"
          label="Director"
          value={formik.values.name}
          onChange={formik.handleChange}
          error={formik.touched.name && Boolean(formik.errors.name)}
          helperText={formik.touched.name && formik.errors.name}
        />
        <TextField
        variant="outlined"
          id="url"
          name="url"
          label="URL"
          value={formik.values.url}
          onChange={formik.handleChange}
          error={formik.touched.url && Boolean(formik.errors.url)}
          helperText={formik.touched.url && formik.errors.url}
        />
            <FormControl className={classes.formControl} variant="outlined">
        <InputLabel htmlFor="country">Country</InputLabel>
        <Select
          native
          variant="outlined"
          id="country"
          name="country"
          value={formik.values.country}
          onChange={formik.handleChange}
          error={formik.touched.country && Boolean(formik.errors.country)}
          helperText={formik.touched.country && formik.errors.country}
          label="Country"
          inputProps={{
            name: 'country',
            id: 'outlined-age-native-simple',
          }}
        >
          <option aria-label="None" value="" />
          {
              
              countryData.map((e) => {
              return <option key={e._id} value={e._id}>{e.name}</option>;
            })}
        </Select>
      </FormControl>
      <Button color="primary" variant="contained" type="submit">
          Submit
        </Button>
        </form>    
    </div>)
}