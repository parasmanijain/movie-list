import { GET_MOVIE_AWARDS_URL } from '../../helper/config';
import { getData } from '../HOC/getData';
import { ChartContainer } from '../templates';
export default getData(ChartContainer, { apiUrl: GET_MOVIE_AWARDS_URL, title: 'Movies', stacked: true });
