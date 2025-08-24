import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardTitle,
  CRow,
  CCol,
  CSpinner,
  CButton,
} from '@coreui/react'
import { CChartBar } from '@coreui/react-chartjs'
import {
  fetchSouscripteurStats,
  fetchDossiersTraitesParJour,
  fetchSouscripteurStatsDr,
  fetchDossiersTraitesParJourDr
} from '../../../api/souscripteurs'

const WidgetsDropdown = () => {

  const userRole = localStorage.getItem('userRole')

  const userDr = localStorage.getItem('userDr');

  // ⛔️ Ne rien afficher pour le rôle "cadre_commercial"
  if (userRole === 'cadre_commercial') {
    return null
  }

  const [stats, setStats] = useState(null)
  const [dailyTraites, setDailyTraites] = useState([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingChart, setLoadingChart] = useState(false)
  const [showChart, setShowChart] = useState(false)

  useEffect(() => {
    const loadStats = async () => {
      try {
    

        let statsData;

        if (userRole === 'admin' || userRole===  'DG' ) {
          statsData = await fetchSouscripteurStats();
        
         
        } else {
          statsData = await fetchSouscripteurStatsDr(userDr); // Pass userdr here
          
        }
     

       // const statsData = await fetchSouscripteurStats()
        setStats(statsData)
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques :', error)
      } finally {
        setLoadingStats(false)
      }
    }

    loadStats()
  }, [])
/*
  const handleShowChart = async () => {
    setLoadingChart(true)
    try {

      //let dailyData;

      // Conditionally fetch data based on user role
    //  if (userRole === 'membre') {
      
      //  dailyData = await fetchDossiersTraitesParJourDr(6);  // Pass userdr here
     // } else {
       
     // dailyData = await fetchDossiersTraitesParJour();
     // }





      const dailyData = await fetchDossiersTraitesParJour();
      console.log(dailyData);
      setDailyTraites(dailyData || [])
      setShowChart(true)
    } catch (error) {
      console.error('Erreur lors du chargement des données par jour :', error)
    } finally {
      setLoadingChart(false)
    }
  }
*/


const handleShowChart = async () => {
  setLoadingChart(true);
  try {
    let dailyData;

    if (userRole === 'membre') {
      dailyData = await fetchDossiersTraitesParJourDr(userDr); // Fetch for a specific "userDr"
    } else {
      dailyData = await fetchDossiersTraitesParJour(); // For other roles
    }

    console.log(dailyData);
    setDailyTraites(dailyData || []);
    setShowChart(true);
  } catch (error) {
    console.error('Erreur lors du chargement des données par jour :', error);
  } finally {
    setLoadingChart(false);
  }
};


  const allItems = [
    { label: 'Total', value: stats?.total, color: 'primary' },
    { label: 'Assignés', value: stats?.assigned, color: 'info' },
    { label: 'Favorables', value: stats?.favorable, color: 'success' },
    { label: 'Défavorables', value: stats?.defavorable, color: 'danger' },

    { label: 'A completer', value: stats?.complete, color: 'warning' },
    { label: 'Traités', value: stats?.traites, color: 'success' },
    { label: 'Assigné a traiter', value: stats?.assigned-stats?.traites, color: 'secondary' },


    { label: 'Favorable (traitement)', value: stats?.valide_traitement+4, color: 'success' },
    { label: 'Favorable (mhuv)', value: stats?.valide_mhuv, color: 'success' },
    { label: 'Favorable (dgdn)', value: stats?.valide_dgdn, color: 'success' },

    { label: 'Défavorables (traitement)', value: stats?.rejete_traitement, color: 'danger' },
    { label: 'Défavorables (mhuv)', value: stats?.rejete_mhuv, color: 'danger' },
    { label: 'Défavorables (dgdn)', value: stats?.rejete_dgdn, color: 'danger' },

    { label: 'A completer (traitement)', value: stats?.complete_traitement, color: 'warning' },
    { label: 'A completer (mhuv)', value: stats?.complete_mhuv, color: 'warning' },
    { label: 'A completer (dgdn)', value: stats?.complete_dgdn, color: 'warning' },


    { label: 'Restants', value: stats?.restants, color: 'secondary' },

  ]

  const statItems = userRole === 'membre'
  ? allItems.slice(0, 7) 
  : allItems; 


  const chartLabels = dailyTraites.map((item) =>
    new Date(item.jour).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
    })
  )

  const favorableData = dailyTraites.map((item) => item.favorable || 0)
  const defavorableData = dailyTraites.map((item) => item.defavorable || 0)
  const completeData = dailyTraites.map((item) => item.complete || 0)
  return (
    <div>
      <CRow>
        <CCol>
          <CCard className="shadow-sm rounded-3 card-shadow">
            <CCardBody>
              <CCardTitle className="mb-4 text-center fs-4 fw-bold">
                 Statistiques des souscripteurs 
              </CCardTitle>
              {loadingStats ? (
                <div className="text-center py-5">
                  <CSpinner color="primary" />
                </div>
              ) : (
                <CRow className="text-center">
                  {statItems.map((item, index) => (
                    <CCol key={index} xs={6} md={4} className="mb-4">
                      <h6 className="text-muted">{item.label}</h6>
                      <div className={`fs-3 fw-semibold text-${item.color}`}>
                        {item.value ?? '↻'}
                      </div>
                    </CCol>
                  ))}
                </CRow>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Button to trigger chart fetch */}
      <CRow className="mt-4 justify-content-center ">
        <CCol xs="auto">
          <CButton color="dark" variant="outline" onClick={handleShowChart} className='card-shadow' disabled={loadingChart || showChart}>
            {loadingChart ? 'Chargement...' : 'Afficher les dossiers par jour'}
          </CButton>
        </CCol>
      </CRow>

      {showChart && (
        <CRow className="mt-4 mb-4">
          <CCol>
            <CCard className="shadow-sm rounded-3 card-shadow">
              <CCardBody>
                <CCardTitle className="mb-4 text-center fs-5 fw-bold">
                  Dossiers traités par jour 
                </CCardTitle>
                <CChartBar
                  style={{ height: '320px' }}
                  data={{
                    labels: chartLabels,
                    datasets: [
                      {
                        label: 'Favorables',
                        backgroundColor: '#28a745',
                        borderRadius: 8,
                        data: favorableData,
                      },
                      {
                        label: 'Défavorables',
                        backgroundColor: '#dc3545',
                        borderRadius: 8,
                        data: defavorableData,
                      },

                      {
                        label: 'A completer',
                        backgroundColor: '#f5c842',
                        borderRadius: 8,
                        data: completeData,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top',
                        labels: {
                          color: '#495057',
                          font: {
                            size: 14,
                            weight: 'bold',
                          },
                        },
                      },
                      tooltip: {
                        backgroundColor: '#212529',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#ccc',
                        borderWidth: 1,
                      },
                    },
                    scales: {
                      x: {
                        stacked: true,
                        ticks: {
                          color: '#6c757d',
                          font: { size: 12 },
                        },
                        grid: { display: false },
                      },
                      y: {
                        stacked: true,
                        beginAtZero: true,
                        ticks: {
                          stepSize: 5,
                          color: '#6c757d',
                        },
                        grid: {
                          drawBorder: false,
                          color: 'rgba(0, 0, 0, 0.05)',
                        },
                      },
                    },
                  }}
                />
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      )}
    </div>
  )
}

export default WidgetsDropdown
