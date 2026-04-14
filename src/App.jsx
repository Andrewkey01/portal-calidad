import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import './App.css'

function App() {
  const [paso, setPaso] = useState('login')
  const [asesores, setAsesores] = useState([])
  const [seleccionado, setSeleccionado] = useState(null)
  const [form, setForm] = useState({ correo: '', password: '' })

  useEffect(() => {
    if (paso === 'registro') {
      const getAsesores = async () => {
        const { data } = await supabase.from('lista_asesores').select('*').eq('registrado', false)
        if (data) setAsesores(data)
      }
      getAsesores()
    }
  }, [paso])

  const handleLogin = async (e) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({
      email: form.correo,
      password: form.password,
    })
    if (error) alert("Error: " + error.message)
    else alert("¡Bienvenido al Portal!")
  }

  const finalizarRegistro = async (e) => {
    e.preventDefault()
    
    // 1. Registro en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.correo,
      password: form.password,
    })

    if (authError) {
      alert("Error: " + authError.message)
      return
    }

    // 2. Actualizar tabla de asesores
    const { error: dbError } = await supabase
      .from('lista_asesores')
      .update({ registrado: true, correo: form.correo })
      .eq('id', seleccionado.id)
    
    if (!dbError) {
      // VENTANA DE CONFIRMACIÓN MEJORADA
      alert(`✅ ¡USUARIO REGISTRADO!\n\n${seleccionado.nombre}, tu cuenta ha sido creada con éxito. Ya puedes iniciar sesión.`);
      
      // Limpiar y volver al login
      setSeleccionado(null)
      setPaso('login')
    } else {
      alert("Error al vincular: " + dbError.message)
    }
  }

  return (
    <>
      <header className="header-lozamora">
        <img src="https://grupolozamora.com.pe/wp-content/uploads/2023/10/logo-lozamora.png" className="logo-img" alt="Lozamora" />
      </header>

      <main className="main-portal">
        <div className="login-card">
          {paso === 'login' ? (
            <form onSubmit={handleLogin}>
              <h2 style={{marginBottom: '30px'}}>Portal Calidad</h2>
              <input type="email" placeholder="Correo" className="input-field" required onChange={(e) => setForm({...form, correo: e.target.value})} />
              <input type="password" placeholder="Contraseña" className="input-field" required onChange={(e) => setForm({...form, password: e.target.value})} />
              <button type="submit" className="btn-verde">Ingresar</button>
              <p style={{marginTop: '25px', fontSize: '13px'}}>
                <span style={{color: '#00B178', cursor: 'pointer', fontWeight: 'bold'}} onClick={() => setPaso('registro')}>
                  ¿ES TU PRIMERA VEZ? REGÍSTRATE
                </span>
              </p>
            </form>
          ) : (
            <div>
              <h2 style={{marginBottom: '20px'}}>Registro</h2>
              {!seleccionado ? (
                <>
                  <p style={{color: '#aaa', fontSize: '14px', marginBottom: '15px'}}>Selecciona tu nombre de la lista:</p>
                  <select onChange={(e) => setSeleccionado(asesores.find(a => a.id == e.target.value))} className="login-select">
                    <option value="">Buscar mi nombre...</option>
                    {asesores.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                  </select>
                  <button onClick={() => setPaso('login')} style={{background: 'none', border: 'none', color: '#888', cursor: 'pointer', marginTop: '10px'}}>← Volver al inicio</button>
                </>
              ) : (
                <form onSubmit={finalizarRegistro}>
                  <p style={{marginBottom: '20px'}}>Bienvenido, <b style={{color: '#00B178'}}>{seleccionado.nombre}</b></p>
                  <input type="email" placeholder="Ingresa un correo personal" className="input-field" required onChange={(e) => setForm({...form, correo: e.target.value})} />
                  <input type="password" placeholder="Crea tu contraseña" className="input-field" required onChange={(e) => setForm({...form, password: e.target.value})} />
                  <button type="submit" className="btn-verde">Finalizar Registro</button>
                  <button onClick={() => setSeleccionado(null)} style={{background: 'none', border: 'none', color: '#888', cursor: 'pointer', marginTop: '15px', display: 'block', width: '100%'}}>Elegir otro nombre</button>
                </form>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="footer-autor">
        <div className="copyright-text">Copyright © 2026 Portal Calidad</div>
        <div className="firma-farid">Desarrollado por FaridCh</div>
      </footer>
    </>
  )
}

export default App