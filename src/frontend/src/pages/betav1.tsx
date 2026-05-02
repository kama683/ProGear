import React,{useState,useEffect} from 'react'


function GymDiary(){

    const [exercises,setExercises]=useState<any[]>([])
    const [name,setName] = useState('')
    const [weight,setWeight]=useState('')
    const [reps,setReps] = useState('')
    const [sets,setSets]=useState('3')
    const [type,setType] = useState('chest')
    const [note,setNote]=useState("")
    const [date,setDate] = useState('')
    const [search,setSearch]=useState('')
    const [filterType,setFilterType] = useState('all')
    const [editId,setEditId]=useState<any>(0)
    const [editName,setEditName] = useState('')
    const [editWeight, setEditWeight] = useState('')
    const [showStats,setShowStats]=useState(false)
    const [sortBy, setSortBy] = useState('date')
    const [order,setOrder]='desc' as any
    const [order2,setOrder2]=useState('desc')
    const [tab,setTab] = useState(1)
    const [units,setUnits]='kg' as any
    const [units2,setUnits2]=useState('kg')
    // const [feeling,setFeeling]=useState(3)  // потом
    const [bodyweight,setBodyweight] = useState('')
    const [duration,setDuration]=useState('')
    const [error,setError] = useState('')
    const [msg,setMsg]=useState('')


    // достаем из локалсторадж
    useEffect(()=>{
        let saved=localStorage.getItem('exercises')
        if(saved){
            try{
                let data = JSON.parse(saved)
                setExercises(data)
            }catch(e){
                console.log(e)
                console.log('не получилось распарсить')
            }
        }
        let bw = localStorage.getItem('bw')
        if(bw)setBodyweight(bw)
    },[])

    // сохранение в локалсторадж
    useEffect(()=>{
        localStorage.setItem('exercises',JSON.stringify(exercises))
        // console.log('сохранил',exercises)
    },[exercises])


    function addExercise(){
        // валидация
        if(name==''){
            setError('напиши название упражнения')
            return
        }
        if(weight==''){
            setError('укажи вес')
            return;
        }
        if(reps == ''){
            setError("сколько раз?")
            return
        }
        let w = parseFloat(weight)
        let r = parseInt(reps)
        let s = parseInt(sets)
        if(isNaN(w)||w<0){
            setError('вес какой то странный')
            return
        }
        if(isNaN(r)||r<=0){
            setError('повторений должно быть больше 0')
            return
        }
        if(isNaN(s)||s<=0){
            s=3
        }
        if(w>500){
            if(!confirm('точно '+w+' кг?? может опечатка'))return
        }

        let newEx = {
            id: Date.now(),
            name: name,
            weight: w,
            reps: r,
            sets: s,
            type: type,
            note: note,
            date: date||new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString(),
            volume: w*r*s
        }
        setExercises([newEx,...exercises])
        setName('')
        setWeight('')
        setReps('')
        // setSets('3')
        setNote('')
        setError('')
        setMsg('добавлено!')
        setTimeout(()=>{setMsg('')},2000)
    }


    function delExercise(id:any){
        if(!confirm('удалить?'))return
        let res=[]
        for(let i=0;i<exercises.length;i++){
            if(exercises[i].id!=id)res.push(exercises[i])
        }
        setExercises(res)
    }

    const startEdit=(ex:any)=>{
        setEditId(ex.id)
        setEditName(ex.name)
        setEditWeight(String(ex.weight))
    }

    function saveEdit(){
        if(editName=='')return
        let w = parseFloat(editWeight)
        if(isNaN(w))return
        let upd = exercises.map((e)=>{
            if(e.id == editId){
                return {...e,name:editName,weight:w,volume:w*e.reps*e.sets}
            }
            return e
        })
        setExercises(upd)
        setEditId(0)
        setEditName('')
            setEditWeight('')
    }

    function cancelEdit(){
        setEditId(0)
    }

    const dupExercise=(ex:any)=>{
        // продублировать упражнение на сегодня
        let copy={
            ...ex,
            id:Date.now(),
            date:new Date().toISOString().split('T')[0],
            createdAt:new Date().toISOString()
        }
        setExercises([copy,...exercises])
    }

    function clearAll(){
        if(!confirm('точно все удалить??'))return
        if(!confirm('реально все? отменить нельзя'))return
        setExercises([])
    }


    // фильтрация
    let list=exercises
    if(filterType!='all'){
        list = exercises.filter(e=>e.type==filterType)
    }
    if(search!=''){
        let q = search.toLowerCase()
        list = list.filter((e)=>{
            if(e.name.toLowerCase().includes(q))return true
            if(e.note&&e.note.toLowerCase().includes(q))return true
            return false
        })
    }


    // сортировка
    if(sortBy=='date'){
        list = [...list].sort((a,b)=>{
            let d1 = new Date(a.createdAt).getTime()
            let d2 = new Date(b.createdAt).getTime()
            if(order2=='desc')return d2-d1
            return d1-d2
        })
    }
    if(sortBy == 'weight'){
        list=[...list].sort((a,b)=>{
            if(order2=='desc')return b.weight-a.weight
            return a.weight-b.weight
        })
    }
    if(sortBy=='volume'){
        list=[...list].sort((a,b)=>order2=='desc'?b.volume-a.volume:a.volume-b.volume)
    }
    if(sortBy=='name'){
        list = [...list].sort((a,b)=>{
            if(a.name>b.name)return order2=='desc'?-1:1
            if(a.name<b.name)return order2=='desc'?1:-1
            return 0
        })
    }


    // считаем стату
    let totalVolume=0
    let totalSets = 0
    let totalReps=0
    let maxWeight = 0
    let maxWeightEx=''
    let chestCount=0
    let backCount = 0
    let legsCount=0
    let armsCount = 0

    for(let i=0;i<exercises.length;i++){
        totalVolume += exercises[i].volume
        totalSets+=exercises[i].sets
        totalReps += exercises[i].reps*exercises[i].sets
        if(exercises[i].weight>maxWeight){
            maxWeight=exercises[i].weight
            maxWeightEx=exercises[i].name
        }
        if(exercises[i].type=='chest')chestCount++
        if(exercises[i].type == 'back')backCount++
        if(exercises[i].type=='legs')legsCount++
        if(exercises[i].type=='arms')armsCount++
    }


    // тренировки за последние 7 дней
    let last7 = 0
    let now = Date.now()
    let week = 7*24*60*60*1000
    for(let i=0;i<exercises.length;i++){
        let t = new Date(exercises[i].createdAt).getTime()
        if(now-t<=week)last7++
    }


    function getColor(t:any){
        if(t=='chest')return '#e74c3c'
        if(t=='back') return '#3498db'
        if(t == 'legs')return '#2ecc71'
        if(t=='arms')return '#f39c12'
        if(t=='cardio')return '#9b59b6'
        return '#95a5a6'
    }

    const getEmoji=(t:any)=>{
        if(t=='chest')return '💪'
        if(t=='back')return '🔙'
        if(t=='legs')return '🦵'
        if(t=='arms')return '💪'
        if(t=='cardio')return '🏃'
        return '🏋'
    }

    function formatDate(d:any){
        if(!d)return ''
        let date = new Date(d)
        let day = date.getDate()
        let m = date.getMonth()+1
        let y=date.getFullYear()
        let dd = day<10?'0'+day:''+day
        let mm=m<10?'0'+m:''+m
        return dd+'.'+mm+'.'+y
    }


    function saveBw(){
        localStorage.setItem('bw',bodyweight)
        setMsg('вес сохранен')
        setTimeout(()=>setMsg(''),1500)
    }


    return (
        <div style={{padding:20,fontFamily:'Arial',maxWidth:900,margin:'0 auto'}}>
            <h1 style={{textAlign:'center'}}>🏋 Дневник тренировок</h1>

            {msg?<div style={{padding:10,background:'#d4edda',color:'#155724',marginBottom:10,borderRadius:5}}>{msg}</div>:null}


            <div style={{borderBottom:'2px solid #ccc',marginBottom:15}}>
                <button onClick={()=>setTab(1)} style={{
                    padding:'10px 20px',
                    background:tab==1?'#007bff':'transparent',
                    color:tab==1?'white':'black',
                    border:'none',
                    cursor:'pointer'
                }}>Записи</button>
                <button onClick={()=>setTab(2)} style={{
                    padding:'10px 20px',
                    background:tab==2?'#007bff':'transparent',
                    color:tab==2?'white':'black',
                    border:'none',
                    cursor: 'pointer'
                }}>Статистика</button>
                    <button onClick={()=>setTab(3)} style={{
                        padding:'10px 20px',
                        background:tab==3?'#007bff':'transparent',
                        color:tab==3?'white':'black',
                        border:'none',
                        cursor:'pointer'
                    }}>Профиль</button>
            </div>


            {tab==1?(
                <div>
                    <div style={{padding:15,border:'1px solid #ddd',borderRadius:5,marginBottom:15,background:'#f9f9f9'}}>
                        <h3>Добавить упражнение</h3>
                        {error?<div style={{color:'red',marginBottom:10}}>⚠ {error}</div>:null}

                        <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
                            <input
                                type="text"
                                value={name}
                                onChange={(e)=>setName(e.target.value)}
                                placeholder='название (напр. жим лежа)'
                                style={{padding:7,width:'250px'}}
                            />
                            <input
                                type="number"
                                value={weight}
                                onChange={(e)=>{setWeight(e.target.value)}}
                                placeholder="вес"
                                style={{padding:'7px',width:'80px'}}
                            />
                            <span style={{padding:'7px 0'}}>{units2}</span>
                            <input
                                type="number"
                                value={reps}
                                onChange={(e)=>setReps(e.target.value)}
                                placeholder="повт"
                                style={{padding:7,width:70}}
                            />
                            <span style={{padding:'7px 0'}}>x</span>
                            <input
                                type="number"
                                value={sets}
                                onChange={(e)=>setSets(e.target.value)}
                                placeholder="подх"
                                style={{padding:7,width:70}}
                            />
                            <select value={type} onChange={(e)=>setType(e.target.value)} style={{padding:7}}>
                                <option value="chest">грудь</option>
                                <option value="back">спина</option>
                                <option value="legs">ноги</option>
                                <option value="arms">руки</option>
                                <option value="cardio">кардио</option>
                                <option value="other">другое</option>
                            </select>
                            <input
                                type="date"
                                value={date}
                                onChange={(e)=>setDate(e.target.value)}
                                style={{padding:7}}
                            />
                        </div>
                        <textarea
                            value={note}
                            onChange={(e)=>setNote(e.target.value)}
                            placeholder='заметка (как себя чувствовал и тд)'
                            style={{padding:7,width:'100%',marginTop:5,minHeight:50,boxSizing:'border-box'}}
                        />
                        <button onClick={addExercise} style={{
                            padding:'8px 20px',
                            background:'#28a745',
                            color:'white',
                            border:'none',
                            borderRadius:3,
                            cursor:'pointer',
                            marginTop:5
                        }}>Записать</button>
                    </div>


                    <div style={{marginBottom:10,display:'flex',gap:5,flexWrap:'wrap'}}>
                        <input
                            type="text"
                            value={search}
                            onChange={(e)=>setSearch(e.target.value)}
                            placeholder='🔍 поиск...'
                            style={{padding:5,width:180}}
                        />
                        <select value={filterType} onChange={(e)=>setFilterType(e.target.value)} style={{padding:5}}>
                            <option value="all">все группы</option>
                            <option value="chest">грудь</option>
                            <option value="back">спина</option>
                            <option value="legs">ноги</option>
                            <option value="arms">руки</option>
                            <option value="cardio">кардио</option>
                        </select>
                        <select value={sortBy} onChange={(e)=>setSortBy(e.target.value)} style={{padding:5}}>
                            <option value="date">по дате</option>
                            <option value="weight">по весу</option>
                            <option value="volume">по объему</option>
                            <option value="name">по названию</option>
                        </select>
                        <button onClick={()=>setOrder2(order2=='desc'?'asc':'desc')} style={{padding:5}}>
                            {order2=='desc'?'↓':'↑'}
                        </button>
                        <button onClick={clearAll} style={{padding:5,background:'#dc3545',color:'white',border:'none',cursor:'pointer'}}>
                            очистить
                        </button>
                    </div>

                    {list.length==0?(
                        <div style={{padding:40,textAlign:'center',color:'#999',border:'2px dashed #ccc',borderRadius:5}}>
                            {search||filterType!='all'?'ничего не найдено':'пока ничего не записано, начни тренировку!'}
                        </div>
                    ):(
                        <div>
                            {list.map((ex,idx)=>{
                                return (
                                    <div key={ex.id} style={{
                                        padding:12,
                                        border:'1px solid #ddd',
                                        borderLeft:'5px solid '+getColor(ex.type),
                                        borderRadius:5,
                                        marginBottom:8,
                                        background:'white'
                                    }}>
                                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                                            <div style={{flex:1}}>
                                                {editId==ex.id?(
                                                    <div>
                                                        <input
                                                            type="text"
                                                            value={editName}
                                                            onChange={(e)=>setEditName(e.target.value)}
                                                            style={{padding:5,width:200,marginRight:5}}
                                                            autoFocus
                                                        />
                                                        <input
                                                            type="number"
                                                            value={editWeight}
                                                            onChange={(e)=>setEditWeight(e.target.value)}
                                                            style={{padding:5,width:80,marginRight:5}}
                                                        />
                                                        <button onClick={saveEdit} style={{padding:'5px 10px',background:'green',color:'white',border:'none',marginRight:3}}>OK</button>
                                                        <button onClick={cancelEdit} style={{padding:'5px 10px'}}>отмена</button>
                                                    </div>
                                                ):(
                                                    <div>
                                                        <span style={{fontSize:18,marginRight:5}}>{getEmoji(ex.type)}</span>
                                                        <strong style={{fontSize:16}}>{ex.name}</strong>
                                                        <div style={{fontSize:14,color:'#666',marginTop:3}}>
                                                            {ex.weight}{units2} × {ex.reps} × {ex.sets} подх. = <b>{ex.volume}{units2}</b>
                                                        </div>
                                                        <div style={{fontSize:11,color:'#999',marginTop:2}}>
                                                            📅 {formatDate(ex.date)} | #{idx+1}
                                                        </div>
                                                        {ex.note?(
                                                            <div style={{fontSize:12,color:'#777',marginTop:5,fontStyle:'italic',padding:5,background:'#fafafa'}}>
                                                                💬 {ex.note}
                                                            </div>
                                                        ):null}
                                                    </div>
                                                )}
                                            </div>
                                            {editId!=ex.id?(
                                                <div>
                                                    <button onClick={()=>dupExercise(ex)} title="продублировать на сегодня" style={{padding:5,marginRight:3,cursor:'pointer'}}>📋</button>
                                                    <button onClick={()=>startEdit(ex)} style={{padding:5,marginRight:3,cursor:'pointer'}}>✏️</button>
                                                    <button onClick={()=>delExercise(ex.id)} style={{padding:5,background:'#dc3545',color:'white',border:'none',cursor:'pointer'}}>✕</button>
                                                </div>
                                            ):null}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            ):null}


            {tab==2?(
                <div>
                    <h2>Статистика</h2>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:15}}>
                        <div style={{padding:15,background:'#e3f2fd',borderRadius:5}}>
                            <div style={{fontSize:12,color:'#666'}}>Всего записей</div>
                            <div style={{fontSize:28,fontWeight:'bold'}}>{exercises.length}</div>
                        </div>
                        <div style={{padding:15,background:'#fff3e0',borderRadius:5}}>
                            <div style={{fontSize:12,color:'#666'}}>За 7 дней</div>
                            <div style={{fontSize:28,fontWeight:'bold'}}>{last7}</div>
                        </div>
                        <div style={{padding:15,background:'#f3e5f5',borderRadius:5}}>
                            <div style={{fontSize:12,color:'#666'}}>Общий объем</div>
                            <div style={{fontSize:28,fontWeight:'bold'}}>{totalVolume}{units2}</div>
                        </div>
                        <div style={{padding:15,background:'#e8f5e9',borderRadius:5}}>
                            <div style={{fontSize:12,color:'#666'}}>Макс вес</div>
                            <div style={{fontSize:28,fontWeight:'bold'}}>{maxWeight}{units2}</div>
                            <div style={{fontSize:11,color:'#666'}}>{maxWeightEx}</div>
                        </div>
                    </div>

                    <div style={{padding:15,border:'1px solid #ddd',borderRadius:5}}>
                        <h3>По группам мышц</h3>
                        <div>💪 Грудь: {chestCount}</div>
                        <div>🔙 Спина: {backCount}</div>
                        <div>🦵 Ноги: {legsCount}</div>
                        <div>💪 Руки: {armsCount}</div>
                        <div style={{marginTop:10,fontSize:13,color:'#666'}}>
                            Всего подходов: {totalSets} | Всего повторений: {totalReps}
                        </div>
                    </div>
                </div>
            ):null}


            {tab==3?(
                <div>
                    <h2>Профиль</h2>
                    <div style={{padding:15,border:'1px solid #ddd',borderRadius:5}}>
                        <label>Твой вес ({units2}):</label><br/>
                        <input
                            type="number"
                            value={bodyweight}
                            onChange={(e)=>setBodyweight(e.target.value)}
                            style={{padding:7,width:120,marginRight:5}}
                            placeholder="напр. 75"
                        />
                        <button onClick={saveBw} style={{padding:7,background:'#007bff',color:'white',border:'none',cursor:'pointer'}}>сохранить</button>

                        <div style={{marginTop:15}}>
                            <label>Единицы измерения:</label><br/>
                            <select value={units2} onChange={(e)=>setUnits2(e.target.value)} style={{padding:7,marginTop:5}}>
                                <option value="kg">килограммы</option>
                                <option value="lb">фунты</option>
                            </select>
                        </div>
                    </div>
                </div>
            ):null}


            <div style={{marginTop:30,padding:10,fontSize:11,color:'#aaa',textAlign:'center'}}>
                сделано на коленке | данные хранятся только у тебя
            </div>
        </div>
    )
}

export default GymDiary