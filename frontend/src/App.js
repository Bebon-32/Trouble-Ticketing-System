import { Routes, Route } from "react-router-dom";
import "./App.css";
import Signup from "./Components/User/Signup/Signup";
import Login from "./Components/User/Login/Login";
import TtsHome from "./Components/UserTTS/TtsHome";
import React, { useContext } from "react";
import { authContext } from "./Components/store/Context/AuthContext";
import TicketForm from "./Components/UserTTS/TicketForm";
import FaqsData from './Components/UserTTS/FaqsData';
import MyTicket from "./Components/UserTTS/MyTicket";
import HomePageAll from "./Components/NewHome/HomePageAll";
import Dashbord from "./Components/Admin/Dashbord";
import Dash from "./Components/Admin/Dash";
import DeleteAdmin from "./Components/Admin/DeleteAdmin";
import UpdataFaq from "./Components/Admin/UpdataFaq";
import ShowReport from "./Components/Admin/ShowReport";
import AssignTicket from "./Components/Admin/AssignTicket";
import NavbarAll from "./Components/NewHome/NavbarAll";
import Faqs from "./Components/Agent/faqs";
import Customer from "./Components/Agent/Customer";
import Article from "./Components/Agent/tickets";
import Reports from "./Components/Agent/reports";
import Navbar from './Components/Home/Navbar';
import DashboardOH from "./Components/officeHeader/DashboardOH";
import Chart from "./Components/Admin/Chart/Chart";
import Chart2 from "./Components/Admin/Chart2/Chart2";
import NotFound from "./Components/Redirect/NotFound";



function App() {
  const isAuthen = useContext(authContext);
  const userLogen = isAuthen.isLoggend && isAuthen.role === 'user';
  const AgentLogen = isAuthen.isLoggend && isAuthen.role === 'agent';
  const adminLogen = isAuthen.isLoggend && isAuthen.role === 'admin';
  const officeLogen = isAuthen.isLoggend && isAuthen.role === 'H_O';

  return (
    <>

      {
        adminLogen ? (
          <React.Fragment>
            <Navbar />
            <Routes>
              <Route path="/Dashbord" element={<Dashbord />} />
              <Route path="/Dash" element={<Dash />} />
              <Route path="/DeleteAdmin" element={<DeleteAdmin />} />
              <Route path="/UpdataFaq" element={<UpdataFaq />} />
              <Route path="/ShowReport" element={<ShowReport />} />
              <Route path="/AssignTicket" element={<AssignTicket />} />
              <Route path="/Chart" element={<Chart />} />
              <Route path="/Chart2" element={<Chart2 />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </React.Fragment>

        )
          : ('')
      }
      {
        AgentLogen ? (
          <Routes>
            <Route path="/faqs" element={<Faqs />} />
            <Route path="/Customer" element={<Customer />} />
            <Route path="/" exact element={<Article />} />
            <Route path="/" element={<Faqs />} />
            <Route path="/report" element={<Reports />} />
            <Route path="/tickets" element={<Article />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        ) : ''
      }

      {userLogen ? (
        <React.Fragment>
          <NavbarAll />
          <Routes>

            <Route path="/HomeUser" element={<TtsHome />} />
            <Route path="/Faqs" element={<FaqsData />} />
            <Route path="/HomeUser" element={<TtsHome />} />
            <Route path="/myTickets" element={<MyTicket />} />
            <Route path="/submit_ticket" element={<TicketForm />} />
            <Route path="*" element={<NotFound />} />

          </Routes>

        </React.Fragment>
      ) : (
        ' '
      )}
      {
        officeLogen ? (
          <>
          <NavbarAll />
          <Routes>
            <Route path="/officeHeaderHome/*" element={<DashboardOH />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </>
        ) : ''
      }
      {
        !userLogen && !AgentLogen && !adminLogen && !officeLogen ?
          (
            <React.Fragment>
              <NavbarAll />
              <Routes>
                <Route exact path="/" element={<HomePageAll />} />
                <Route path="/Home" element={<HomePageAll />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </React.Fragment>
          ) : ' '
      }
    </>
  );
}

export default App;
