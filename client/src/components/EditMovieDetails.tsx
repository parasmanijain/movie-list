import React, {useState, useEffect} from 'react';
import { RouteComponentProps, useParams } from "react-router-dom";
import axios from 'axios';
import Datetime from "react-datetime";
import 'react-datetime/css/react-datetime.css';

interface RouteParams {
  movieID: string
}

export const EditMovieDetails = (props) => {
  const {movieID} = useParams<RouteParams>();
    const fetchData = () => {
        const languages = axios.get('http://localhost:8000/languages');
        const directors = axios.get('http://localhost:8000/directors');
        const movieDetails = axios.get('http://localhost:8000/movieDetails', {
            params: {
                movieID:movieID
              }
        });
        axios.all([languages, directors, movieDetails]).then(axios.spread((...responses) => {
          setLanguageData(responses[0].data);
          setDirectorData(responses[1].data);
          setFormValues(responses[2].data);
        })).catch(errors => {
          // react on errors.
        })
      };
      useEffect(() => {
        fetchData();
        return () => {
      }
      }, [])
      const [formValues, setFormValues] = useState({
          name:'',
          language:'',
          director: '',
          year:'',
          url:'',
          imdb: '',
          rottenTomatoes: ''
      });
      const [languageData,setLanguageData] = useState([]);
      const [directorData,setDirectorData] = useState([]);
      
    const submitHandler = (event) => {
        event.preventDefault();
    
        axios.post('http://localhost:8000/updateMovie', {
            _id: movieID,
            name: formValues.name,
            language: formValues.language,
            director:formValues.director,
            year: formValues.year,
            url:formValues.url,
            imdb: formValues.imdb,
            rottenTomatoes: formValues.rottenTomatoes
        })
        .then(function (response) {
        })
        .catch(function (response) {
        console.log(response);
        })   
    };
    
    const handleChange= (event) => {
        const {name, value} = event.target;
        setFormValues({...formValues, [name]:value});
    }
    
    const setDate = (date) => {
        setFormValues({...formValues, year: date.year()});
    }
    return (
        <div className="main-container">
             <form id="form" onSubmit={submitHandler} autoComplete="off">
            <div>
            <label htmlFor="name">Name</label>
            <input type="text" name="name" value={formValues.name} onChange={handleChange}/>
            </div>
            <div>
            <label htmlFor="language">Language</label>
            <select onChange={handleChange} name="language" value= {formValues.language}>
              <option value="">Select Language</option>
              {
                languageData.map((e) => {
                return <option key={e._id} value={e._id}>{e.name}</option>;
              })}
            </select>
            </div>
           <div>
           <label htmlFor="director">Director</label>
            <select onChange={handleChange} name="director" value= {formValues.director}>
              <option value="">Select Director</option>
              {
                directorData.map((e) => {
                return <option key={e._id} value={e._id}>{e.name}</option>;
              })}
            </select> 
           </div>
           <div>
            <label htmlFor="imdb">IMDB Rating</label>
            <input type="text" name="imdb" value={formValues.imdb} onChange={handleChange}/>
            </div>
            <div>
            <label htmlFor="rottenTomatoes">Rotten Tomatoes Score</label>
            <input type="text" name="rottenTomatoes" value={formValues.rottenTomatoes} onChange={handleChange}/>
            </div>
           <div>
            <label htmlFor="year">Year</label>
            <Datetime  dateFormat="YYYY" timeFormat={false} value= {formValues.year}
            onChange={setDate}/>
           </div>
           <div>
            <label htmlFor="url">URL</label>
            <input type="text" name="url" value={formValues.url} onChange={handleChange}/>
            </div>         
            <input type="submit" value="submit" />
        </form>
        </div>
    )
}
