import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

function App() {
  const [paso, setPaso] = useState('login')
  const [asesores, setAsesores] = useState([])
  const [seleccionado, setSeleccionado] = useState(null)
  const [form, setForm] = useState({ correo: '', password: '' })

  useEffect(() => {
    if (paso === 'registro') {
      const getAsesores = async () => {
        // Traemos solo los que no tienen correo vinculado aún
        const { data } = await supabase.from('lista_asesores').select('*').eq('registrado', false)
        if (data) setAsesores(data)
      }
      getAsesores()
    }
  }, [paso])

  const handleLogin = async (e) => {
    e.preventDefault()
    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.correo,
      password: form.password,
    })

    if (error) {
      alert("Error: " + error.message)
    } else {
      alert("¡Bienvenido al Portal de Calidad!")
      // Aquí podrías redirigir al Dashboard de Power BI
    }
  }

  const finalizarRegistro = async (e) => {
    e.preventDefault()
    
    // 1. Crear el usuario en el sistema de autenticación
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.correo,
      password: form.password,
    })

    if (authError) {
      alert("Error al crear usuario: " + authError.message)
      return
    }

    // 2. Vincular el correo al nombre del asesor en tu tabla
    const { error: dbError } = await supabase
      .from('lista_asesores')
      .update({ 
        registrado: true,
        correo: form.correo // Ahora sí se guarda el correo que el asesor eligió
      })
      .eq('id', seleccionado.id)
    
    if (!dbError) {
      alert(`¡Registro exitoso para ${seleccionado.nombre}! Ahora puedes ingresar.`);
      setPaso('login')
    }
  }

  return (
    <div style={{ backgroundColor: '#121212', color: 'white', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#1e1e1e', padding: '30px', borderRadius: '15px', width: '350px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', border: '1px solid #00B178' }}>
        
        {paso === 'login' ? (
          <form onSubmit={handleLogin}>
            <h2 style={{ textAlign: 'center', marginBottom: '25px', color: '#00B178' }}>Portal Calidad</h2>
            <input 
              type="email" 
              placeholder="Correo" 
              required 
              style={inputStyle} 
              onChange={(e) => setForm({...form, correo: e.target.value})}
            />
            <input 
              type="password" 
              placeholder="Contraseña" 
              required 
              style={inputStyle} 
              onChange={(e) => setForm({...form, password: e.target.value})}
            />
            <button type="submit" style={btnPrincipal}>Ingresar</button>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', marginTop: '15px', textAlign: 'center' }}>
              <span onClick={() => setPaso('registro')} style={{ color: '#00B178', cursor: 'pointer', fontWeight: 'bold' }}>
                ¿ES TU PRIMERA VEZ? REGÍSTRATE AQUÍ
              </span>
              <span style={{ color: '#888', cursor: 'pointer' }}>¿Olvidaste tu contraseña?</span>
            </div>
          </form>
        ) : (
          <div>
            <h2 style={{ textAlign: 'center', color: '#00B178' }}>Registro de Asesor</h2>
            {!seleccionado ? (
              <>
                <p style={{ fontSize: '14px', color: '#aaa', textAlign: 'center' }}>Selecciona tu nombre de la lista de 76 asesores:</p>
                <select onChange={(e) => setSeleccionado(asesores.find(a => a.id == e.target.value))} style={inputStyle}>
                  <option value="">Buscar nombre...</option>
                  {asesores.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                </select>
                <button onClick={() => setPaso('login')} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', width: '100%' }}>Volver al inicio</button>
              </>
            ) : (
              <form onSubmit={finalizarRegistro}>
                <p style={{ textAlign: 'center' }}>Hola, <b style={{ color: '#00B178' }}>{seleccionado.nombre}</b></p>
                <p style={{ fontSize: '12px', color: '#888', marginBottom: '10px' }}>Ingresa el correo que usarás para entrar siempre:</p>
                <input 
                  type="email" 
                  placeholder="Tu correo personal o de trabajo" 
                  required 
                  style={inputStyle} 
                  onChange={(e) => setForm({...form, correo: e.target.value})}
                />
                <input 
                  type="password" 
                  placeholder="Crea una contraseña segura" 
                  required 
                  style={inputStyle} 
                  onChange={(e) => setForm({...form, password: e.target.value})}
                />
                <button type="submit" style={btnPrincipal}>Vincular y Finalizar</button>
                <button onClick={() => setSeleccionado(null)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', width: '100%', marginTop: '10px' }}>Elegir otro nombre</button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const inputStyle = { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #333', backgroundColor: '#2a2a2a', color: 'white', boxSizing: 'border-box' }
const btnPrincipal = { width: '100%', padding: '12px', backgroundColor: '#00B178', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }

export default App