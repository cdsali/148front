

import WidgetsDropdown from '../widgets/WidgetsDropdown'


const Dashboard = () => {


const nomuser=localStorage.getItem('userName');

  return (
    <>

<h2 className=" py-5" style={{color:" transparent !important",
    fontSize: "2em",
    textAlign: "center",
    textShadow:"1px 1px 1px #F0FAEE",
    margin: "0",
    fontFamily: "Bahnschrift Light",
    fontWeight:"bold"
    }}>
       
  {"Bienvenue "+ nomuser}
</h2>

      <WidgetsDropdown className="mb-4"  />
      
  
    </>
  )
}

export default Dashboard
