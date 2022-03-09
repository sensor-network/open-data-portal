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
    console.log(props)
    const initialData = props.initialData;
    

    const endpointUrl = "http://localhost:3000/api/v1";
    const { data, error } = useSWR(endpointUrl, fetcher);

    if (error) return <div>failed to load</div>;
    if (!data) return <div>loading...</div>;
    
  /*  return <div>{data.map( (row) => (
        <div key= {row.id}>
          {row.id}
          {row.temperature}
        </div>
      ))}</div>;*/
      return <p>idk</p>
}

export default App;