import React from 'react'
import { CContainer, CRow, CCol, CButton } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSettings } from '@coreui/icons'

const MaintenancePage = () => {
  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8} lg={6} className="text-center">
            <div className="mb-4">
              <CIcon icon={cilSettings} height={72} width={72} className="text-primary rotate-icon" />
            </div>
            <h1 className="display-4 fw-bold">Site en maintenance</h1>
            <p className="text-muted fs-5">
              Nous effectuons actuellement une mise à jour. Merci de revenir dans quelques instants.
            </p>
            <CButton color="primary" size="lg" onClick={handleRetry}>
              Réessayer
            </CButton>
          </CCol>
        </CRow>
      </CContainer>

      {/* Inline animation style */}
      <style>{`
        .rotate-icon {
          animation: spin 2s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default MaintenancePage
