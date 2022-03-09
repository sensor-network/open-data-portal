import useSWR from 'swr'

const fetcher = (...args) => fetch(...args).then(res => res.json());

export async function getServerSideProps(){
    const endpointUrl = "http://localhost:3000/api/v1";
    const data = await fetcher(endpointUrl);
    return{
        props: {
            initialData: data
        }
    }
}

function App(props){
    const initialData = props.initialData;

    const endpointUrl = "http://localhost:3000/api/v1";
    const options = {fetcher: () => fetcher(endpointUrl),
                    fallbackData: initialData,
                    refreshInterval: 1000 * 60}
    const { data, error } = useSWR(endpointUrl, options);

    if (error) return <div>failed to load</div>;
    if (!data) return <div>loading...</div>;
    
    return <div>
        {data.map( (row) => (
            <div key= {row.id}>
                {row.id} {row.pH} {row.temperature} {row.conductivity} {row.date} {row.longitude} {row.latitude}
            </div>
      ))}</div>;
}

export default App;