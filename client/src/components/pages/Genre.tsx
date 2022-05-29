import { GET_GENRES_COUNT_URL } from '../../helper/config';
import { getData } from '../HOC/getData';
import { ChartContainer } from '../templates';
export default getData(ChartContainer, { apiUrl: GET_GENRES_COUNT_URL, title: 'Genres' });
