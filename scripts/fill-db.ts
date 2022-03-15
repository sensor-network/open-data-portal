import uploadHandler from 'src/pages/api/v1/upload';
import { createMocks } from 'node-mocks-http';
import moment from 'moment';

export const loadData = () => {
    let time = new Date('2022-03-15Z');
    while (time.getTime() <= new Date().getTime()) {
        time = moment(time).add(60, 's').toDate();
        console.log(time);
    }
}

loadData();
