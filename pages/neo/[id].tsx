import useSWR from "swr";
import axios from "axios";
import { useRouter } from "next/router";
import { CChart } from "@coreui/react-chartjs";
import "animate.css";
import styles from "../../styles/Neos.module.css";

const API_KEY = "BChFdP9eJ8HgXJ1wRaktCYG5EI1ns55KaW49bcj8";
const url = "https://api.nasa.gov/neo/rest/v1/neo";
const LUNAR_DISTANCE = 384400;

const fetcher = (url: string, id: string | string[] | undefined) => {
  return axios
    .get(`${url}/${id}`, {
      params: {
        api_key: API_KEY,
      },
    })
    .then((res) => res.data);
};

export default function Neo() {
  const router = useRouter();
  const routeId = router.query.id;
  const { data, error } = useSWR([url, routeId], (url, routeId) =>
    fetcher(url, routeId)
  );

  interface Entry {
    close_approach_date: string,
    close_approach_date_full: string,
    epoch_date_close_approach: number,
    miss_distance: Record<string,string>,
    astronomical: string,
    kilometers: string,
    lunar: string,
    miles: string,
    orbiting_body: string,
    relative_velocity: Record<string,string>,
    kilometers_per_hour: string,
    kilometers_per_second: string,
    miles_per_hour: string
  }

  function calculateClosestDistance(approachDate: Entry[]) {
    const distances = approachDate.map(
      (object) => object.miss_distance.kilometers
    );
    const numbers = distances.map(element => parseInt(element))
    const closestDistance = Math.min(...numbers);
    

    return Math.round(closestDistance);
  }

  return (
    <div>
      {error && (
        <div className={styles.container}>Error fetching Single NEO...</div>
      )}
      {!data && !error && (
        <div className={styles.container}>Loading Single NEO...</div>
      )}
      {data && (
        <div className="animate__animated animate__zoomIn">
          <div className={styles.stats}>
            <span>id: {data.id}</span>
            <span>name: {data.name}</span>
            <span>absolute_magnitude_h: {data.absolute_magnitude_h}</span>
            <span>designation: {data.absolute_magnitude_h}</span>
          </div>
          <CChart
            type="bar"
            data={{
              labels: data.close_approach_data.map(
                (entry: Entry) => entry.close_approach_date
              ),
              datasets: [
                {
                  label: "Distance (Km)",
                  backgroundColor: "#f87979",
                  data: data.close_approach_data.map(
                    (entry: Entry) => entry.miss_distance.kilometers
                  ),
                },
              ],
            }}
          />
          <div>
            <div>moon svg</div>
            <span>Average Moon Distance: {LUNAR_DISTANCE} (Km)</span>
            <div className={styles.line}></div>
            <span>
              Closest Distance relative to Average Moon Distance:{" "}
              {calculateClosestDistance(data.close_approach_data)} (Km)
            </span>
            <div
              className={styles.line}
              style={{
                "--progress": calculateClosestDistance(data.close_approach_data) / LUNAR_DISTANCE,
              } as React.CSSProperties} 
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}
