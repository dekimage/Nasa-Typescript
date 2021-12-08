import React from "react";
import { useState } from "react";
import useSWR from "swr";
import axios from "axios";
import moment from "moment";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import Modal from "@mui/material/Modal";
import useModal from "../hooks/Modal";
import TextField from "@mui/material/TextField";
import DatePicker from "@mui/lab/DatePicker";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import "animate.css";

import styles from "../styles/Mars.module.css";

const API_KEY = "BChFdP9eJ8HgXJ1wRaktCYG5EI1ns55KaW49bcj8";
const url = "https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos";




const getRandomDate = (start: Date, end: Date) => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
};
const randomDate = getRandomDate(new Date(2015, 0, 1), new Date());
const randomDateFormated = moment(randomDate).format("YYYY-MM-DD");
const fetcher = (url: string, date: string, page: number) => {
  return axios
    .get(url, {
      params: {
        earth_date: date,
        api_key: API_KEY,
        page,
      },
    })
    .then((res) => res.data);
};


interface Camera  {id: number, name: string, rover_id: number, full_name: string }
interface Rover {id: number, name: string, landing_date: string, launch_date: string,  status: string}

interface Item {
  camera: Camera,
  earth_date: string,
  id: number, 
  img_src: string,
  rover: Rover,
  sol: number
}

interface ImageProps {
  item: Item
}

const Image: React.FC<ImageProps> = ({ item }) => {
  const { isShowing, openModal, closeModal } = useModal();

  return (
    <div>
      <div onClick={openModal} className={styles.image}>
        <img width="100px" src={item.img_src} />
      </div>
      <Modal
        open={isShowing}
        onClose={closeModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <div
          className={`${styles.modal} animate__animated animate__zoomInDown`}
        >
          <img width="100px" src={item.img_src} />
          <span>ID: {item.id}</span>
          <span>Camera: {item.camera.full_name}</span>
          <span>Earth Date: {item.earth_date}</span>
          <span>Sol: {item.sol}</span>
          <span>Rover: {item.rover.name}</span>
        </div>
      </Modal>
    </div>
  );
}

interface Data {
  photos: Item[]
}

interface PageProps {
  data: Data | undefined,
  error: Error | undefined
}

const Page: React.FC<PageProps> = ({ data, error }) => {
  if (error)
    return (
      <div className={styles.container}>Error fetching Mars Images...</div>
    );
  if (!data)
    return <div className={styles.container}>Loading Mars Images...</div>;

  return (
    <div className={styles.container}>
      {data.photos.map((item) => (
        <Image item={item} key={item.id} />
      ))}
    </div>
  );
}

export default function Mars() {
  const [date, setDate] = useState(randomDateFormated);
  const [page, setPage] = useState(1);
  // const [isLastPage, setIsLastPage] = useState(false);
  const { data, error } = useSWR<Data, Error>([url, date, page], (url, date, page) =>
    fetcher(url, date, page)
  );

  function handleNextPage() {
    if (data && data.photos.length < 25) {
      return;
    }
    setPage(page + 1);
  }

  function handlePreviousPage() {
    if (page == 1) {
      return;
    }
    setPage(page - 1);
  }

  return (
    <div>
      <div className={styles.datePicker}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Select Date"
            value={date}
            onChange={(newDate) => {
              if (newDate === date) {
                return;
              }
              const formattedDate = moment(newDate).format("YYYY-MM-DD");
              setPage(1);
              setDate(formattedDate);
            }}
            renderInput={(params) => <TextField {...params} />}
          />
        </LocalizationProvider>
      </div>

      <Page data={data} error={error} />
      <div className={styles.pagination}>
        <button onClick={() => handlePreviousPage()}>Previous</button>
        {page}
        <button onClick={() => handleNextPage()}>Next</button>
      </div>
    </div>
  );
}
