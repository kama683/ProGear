import React, {useState,useEffect} from 'react'

// приложение для задач
// делал на выходных
// потом отрефакторю


function TodoApp(){

    const [todos,setTodos] = useState<any[]>([])
    const [text,setText]=useState('')
    const [text2, setText2] = useState("")
    const [date,setDate]=useState('')
    const [priority,setPriority] = useState('low')
    const [category,setCategory]=useState('work')
    const [filter,setFilter] = useState('all')
    const [search,setSearch]=useState("")
    const [sortBy,setSortBy] = useState('date')
    const [editId,setEditId]=useState<any>(null)
    const [editText, setEditText] = useState('')
    const [showDone,setShowDone]=useState(true)
    const [count,setCount] = useState(0)
    const [count2, setCount2] = useState(0);
        const [theme,setTheme] = useState('light')
    const [user,setUser]=useState('гость')
    // const [tab, setTab] = useState(1)  // потом
    const [open,setOpen] = useState(false)
    const [err,setErr]=useState('')


    // загрузка из localstorage
    useEffect(()=>{
        try{
            let saved = localStorage.getItem('todos')
            if(saved){
                let parsed = JSON.parse(saved)
                setTodos(parsed)
            }
            let savedUser = localStorage.getItem('user')
            if(savedUser){
                setUser(savedUser)
            }
            let savedTheme = localStorage.getItem('theme')
            if(savedTheme)setTheme(savedTheme)
        }catch(e){
            console.log('ошибка',e)
        }
    },[])


    // сохранение
    useEffect(()=>{
        try{
            localStorage.setItem('todos',JSON.stringify(todos))
        }catch(e){
            console.log('не сохранилось',e);
        }
    },[todos])

    useEffect(()=>{
        localStorage.setItem('theme',theme)
    },[theme])


    function addTodo(){
        if(text==''){
            setErr('введи текст')
            return;
        }
        if(text.length<2){
            setErr('слишком коротко')
            return
        }
        if(text.length>200){
            setErr("слишком длинно")
            return
        }
        // создаем новую задачу
        let newTodo = {
            id: Date.now()+Math.floor(Math.random()*1000),
            title: text,
            description: text2,
            date: date||new Date().toISOString(),
            priority: priority,
            category:category,
            done: false,
            createdAt: new Date().toISOString()
        }
        setTodos([...todos,newTodo])
        setText('')
        setText2('')
        setDate('')
        setErr('')
            setCount(count+1)
    }

    const deleteTodo=(id:any)=>{
        if(!confirm('Точно удалить?')){return}
        let newTodos = []
        for(let i=0;i<todos.length;i++){
            if(todos[i].id!=id){
                newTodos.push(todos[i])
            }
        }
        setTodos(newTodos)
        setCount2(count2+1)
    }

    function toggleDone(id:any){
        let newTodos = todos.map((t)=>{
            if(t.id==id){
                return {...t,done:!t.done}
            }
            return t
        })
        setTodos(newTodos);
    }

    const startEdit=(t:any)=>{
        setEditId(t.id)
        setEditText(t.title)
    }

    function saveEdit(){
        if(editText==''){
            alert('пусто')
            return
        }
        let newTodos = todos.map((t)=>{
            if(t.id == editId){
                return {...t,title:editText}
            }
            return t
        })
        setTodos(newTodos)
        setEditId(null)
        setEditText('')
    }

    function cancelEdit(){
        setEditId(null)
        setEditText('')
    }

    const clearDone=()=>{
        if(!confirm('очистить выполненные?'))return
        let newTodos = todos.filter((t)=>!t.done)
        setTodos(newTodos)
    }

    function clearAll(){
        if(!confirm('точно все удалить?'))return
        if(!confirm('реально все?'))return
        setTodos([])
    }


    // фильтрация
    let filtered = todos
    if(filter=='active'){
        filtered = todos.filter(t=>!t.done)
    }
    if(filter == 'done'){
        filtered = todos.filter((t)=>{return t.done})
    }
    if(filter=='work'){
        filtered = todos.filter(t=>t.category=='work')
    }
    if(filter=='home'){
        filtered=todos.filter(t=>t.category=='home')
    }
    if(filter == 'high'){
        filtered = todos.filter(t=>t.priority=='high')
    }

    // поиск
    if(search!=''){
        filtered = filtered.filter((t)=>{
            let s = search.toLowerCase()
            if(t.title.toLowerCase().includes(s))return true
            if(t.description && t.description.toLowerCase().includes(s))return true
            return false
        })
    }

    // не показывать выполненные
    if(!showDone){
        filtered = filtered.filter(t=>!t.done)
    }

    // сортировка
    if(sortBy=='date'){
        filtered=[...filtered].sort((a,b)=>{
            return new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime()
        })
    }
    if(sortBy == 'title'){
        filtered=[...filtered].sort((a,b)=>{
            if(a.title>b.title)return 1
            if(a.title<b.title) return -1
            return 0
        })
    }
    if(sortBy=='priority'){
        let map:any = {high:0,medium:1,low:2}
        filtered = [...filtered].sort((a,b)=>map[a.priority]-map[b.priority])
    }


    // считаем статистику
    let total = todos.length
    let doneCount = 0
    let workCount=0
    let homeCount = 0
    for(let i=0;i<todos.length;i++){
        if(todos[i].done)doneCount++
        if(todos[i].category=='work')workCount++
        if(todos[i].category == 'home')homeCount++
    }
    let percent = total>0?Math.round(doneCount/total*100):0


    function getColor(p:any){
        if(p=='high')return 'red'
        if(p == 'medium') return 'orange'
        return 'green'
    }

    const getIcon=(c:any)=>{
        if(c=='work')return '💼'
        if(c=='home')return '🏠'
        return '📝'
    }


    let bg = theme=='dark'?'#222':'#fff'
    let fg = theme == 'dark' ? '#eee' : '#222'


    return (
        <div style={{padding:'20px',background:bg,color:fg,minHeight:'100vh'}}>
            <div style={{display:'flex',justifyContent:'space-between'}}>
                <h1>Список задач</h1>
                <div>
                    <span style={{marginRight:10}}>Привет, {user}!</span>
                    <button onClick={()=>{
                        let n = prompt('как тебя звать?')
                        if(n){
                            setUser(n)
                            localStorage.setItem('user',n)
                        }
                    }}>Сменить имя</button>
                    <button onClick={()=>setTheme(theme=='dark'?'light':'dark')} style={{marginLeft:5}}>
                        {theme=='dark'?'☀️':'🌙'}
                    </button>
                </div>
            </div>

            <div style={{padding:10,background:theme=='dark'?'#333':'#f0f0f0',marginBottom:15,borderRadius:5}}>
                <p>Всего: {total} | Сделано: {doneCount} | Работа: {workCount} | Дом: {homeCount}</p>
                <p>Прогресс: {percent}%</p>
                <div style={{width:'100%',height:'10px',background:'#ddd',borderRadius:5}}>
                    <div style={{width:percent+'%',height:'100%',background:'green',borderRadius:5}}></div>
                </div>
                <p style={{fontSize:12,color:'#888'}}>Добавлено: {count} | Удалено: {count2}</p>
            </div>


            <div style={{padding:'15px',border:'1px solid #ccc',borderRadius:5,marginBottom:15}}>
                <h3>Новая задача</h3>
                {err?<div style={{color:'red'}}>{err}</div>:null}
                <input
                    type="text"
                    value={text}
                    onChange={(e)=>setText(e.target.value)}
                    placeholder='название'
                    style={{padding:5,width:300,marginRight:5}}
                    onKeyDown={(e)=>{
                        if(e.key=='Enter')addTodo()
                    }}
                />
                <input
                    type="text"
                    value={text2}
                    onChange={(e)=>{setText2(e.target.value)}}
                    placeholder="описание (необязательно)"
                    style={{padding:'5px',width:'300px',marginTop:5}}
                />
                <br/>
                <input
                    type="date"
                    value={date}
                    onChange={(e)=>setDate(e.target.value)}
                    style={{padding:5,marginTop:5,marginRight:5}}
                />
                <select value={priority} onChange={(e)=>setPriority(e.target.value)} style={{padding:5,marginRight:5}}>
                    <option value="low">низкий</option>
                    <option value="medium">средний</option>
                    <option value="high">высокий</option>
                </select>
                <select value={category} onChange={(e)=>{setCategory(e.target.value)}} style={{padding:5,marginRight:5}}>
                    <option value="work">работа</option>
                    <option value="home">дом</option>
                    <option value="other">другое</option>
                </select>
                <button onClick={addTodo} style={{padding:'5px 15px',background:'green',color:'white',border:'none',cursor:'pointer'}}>
                    Добавить
                </button>
            </div>


            <div style={{marginBottom:15}}>
                <input
                    type="text"
                    value={search}
                    onChange={(e)=>setSearch(e.target.value)}
                    placeholder="🔍 поиск..."
                    style={{padding:5,width:200,marginRight:10}}
                />
                <select value={filter} onChange={(e)=>setFilter(e.target.value)} style={{padding:5,marginRight:5}}>
                    <option value="all">все</option>
                    <option value="active">активные</option>
                    <option value="done">выполненные</option>
                    <option value="work">работа</option>
                    <option value="home">дом</option>
                    <option value="high">важные</option>
                </select>
                <select value={sortBy} onChange={(e)=>setSortBy(e.target.value)} style={{padding:5,marginRight:5}}>
                    <option value="date">по дате</option>
                    <option value="title">по названию</option>
                    <option value="priority">по приоритету</option>
                </select>
                <label style={{marginRight:10}}>
                    <input type="checkbox" checked={showDone} onChange={(e)=>setShowDone(e.target.checked)}/>
                    показывать сделанные
                </label>
                <button onClick={clearDone} style={{marginRight:5}}>очистить сделанные</button>
                <button onClick={clearAll} style={{background:'red',color:'white'}}>удалить все</button>
            </div>


            {filtered.length==0?(
                <div style={{padding:30,textAlign:'center',color:'#999'}}>
                    {search?'ничего не найдено':'нет задач'}
                </div>
            ):(
                <ul style={{listStyle:'none',padding:0}}>
                    {filtered.map((t,i)=>{
                        return (
                            <li key={t.id} style={{
                                padding:10,
                                margin:'5px 0',
                                border:'1px solid #ddd',
                                borderRadius:5,
                                background:t.done?(theme=='dark'?'#444':'#f5f5f5'):(theme=='dark'?'#333':'white'),
                                opacity:t.done?0.6:1
                            }}>
                                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                                    <div style={{flex:1}}>
                                        <input
                                            type="checkbox"
                                            checked={t.done}
                                            onChange={()=>toggleDone(t.id)}
                                            style={{marginRight:10}}
                                        />
                                        <span style={{marginRight:5}}>{getIcon(t.category)}</span>
                                        <span style={{
                                            color:getColor(t.priority),
                                            fontWeight:'bold',
                                            marginRight:5,
                                            fontSize:12
                                        }}>
                                            [{t.priority}]
                                        </span>
                                        {editId==t.id?(
                                            <>
                                                <input
                                                    type="text"
                                                    value={editText}
                                                    onChange={(e)=>setEditText(e.target.value)}
                                                    style={{padding:3,width:300}}
                                                    autoFocus
                                                />
                                                <button onClick={saveEdit} style={{marginLeft:5}}>✓</button>
                                                <button onClick={cancelEdit} style={{marginLeft:3}}>✕</button>
                                            </>
                                        ):(
                                            <span style={{textDecoration:t.done?'line-through':'none'}}>
                                                <strong>#{i+1}</strong> {t.title}
                                            </span>
                                        )}
                                        {t.description?(
                                            <div style={{fontSize:12,color:'#888',marginLeft:30,marginTop:3}}>
                                                {t.description}
                                            </div>
                                        ):null}
                                    </div>
                                    <div>
                                        {editId!=t.id&&(
                                            <button onClick={()=>startEdit(t)} style={{marginRight:5}}>
                                                ✏️
                                            </button>
                                        )}
                                        <button
                                            onClick={()=>deleteTodo(t.id)}
                                            style={{background:'red',color:'white',border:'none',padding:'3px 8px',cursor:'pointer'}}
                                        >
                                            🗑
                                        </button>
                                    </div>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            )}


            <div style={{marginTop:30,padding:10,fontSize:12,color:'#888',textAlign:'center'}}>
                <p>сделано на коленке за пару вечеров</p>
                <button onClick={()=>setOpen(!open)}>{open?'скрыть':'показать'} дебаг</button>
                {open?(
                    <pre style={{textAlign:'left',background:'#000',color:'#0f0',padding:10,fontSize:10}}>
                        {JSON.stringify(todos,null,2)}
                    </pre>
                ):null}
            </div>
        </div>
    )
}

export default TodoApp