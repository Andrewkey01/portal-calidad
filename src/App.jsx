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
    else alert("¡Bienvenido!")
  }

  const finalizarRegistro = async (e) => {
    e.preventDefault()
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.correo,
      password: form.password,
    })

    if (authError) {
      alert("Error: " + authError.message)
      return
    }

    const { error: dbError } = await supabase
      .from('lista_asesores')
      .update({ registrado: true, correo: form.correo })
      .eq('id', seleccionado.id)
    
    if (!dbError) {
      alert(`¡Registro exitoso para ${seleccionado.nombre}!`);
      setPaso('login')
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
              <h2>Portal Calidad</h2>
              <input type="email" placeholder="Correo" className="input-field" required onChange={(e) => setForm({...form, correo: e.target.value})} />
              <input type="password" placeholder="Contraseña" className="input-field" required onChange={(e) => setForm({...form, password: e.target.value})} />
              <button type="submit" className="btn-verde">Ingresar</button>
              <p style={{marginTop: '20px', fontSize: '13px'}}>
                <span style={{color: '#00B178', cursor: 'pointer'}} onClick={() => setPaso('registro')}>¿ES TU PRIMERA VEZ? REGÍSTRATE</span>
              </p>
            </form>
          ) : (
            <div>
              <h2>Registro</h2>
              {!seleccionado ? (
                <>
                  <select onChange={(e) => setSeleccionado(asesores.find(a => a.id == e.target.value))} className="login-select">
                    <option value="">Selecciona tu nombre...</option>
                    {asesores.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                  </select>
                  <button onClick={() => setPaso('login')} style={{background: 'none', border: 'none', color: '#888', cursor: 'pointer'}}>Volver</button>
                </>
              ) : (
                <form onSubmit={finalizarRegistro}>
                  <p>Hola, <b>{seleccionado.nombre}</b></p>
                  <input type="email" placeholder="Tu correo" className="input-field" required onChange={(e) => setForm({...form, correo: e.target.value})} />
                  <input type="password" placeholder="Crea contraseña" className="input-field" required onChange={(e) => setForm({...form, password: e.target.value})} />
                  <button type="submit" className="btn-verde">Finalizar Registro</button>
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