const listUl=document.getElementById('list');
const searchTask=document.getElementById('add');

//define list
let list=[];
//define state
let state={
    page:1,
    rows:10,
    window:5,
    btleft:1,
    btright:5,
    filteredData:list,
    totalPages:0
}

//get data from api call
 function getData()
{

    fetch('https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json')
    .then(res=>res.json())
    .then(result=>{
        
        list=result;
        renderList(list,true)
    }).catch(err=>{
        console.log(err);
    })

}

//To add pagination
function pagination(data,page,rows)
{

    //console.log('page',page);
    const trimStart=(page-1)*rows;
   // console.log("trim start",trimStart);
    const trimEnd=trimStart+rows;
    const noOfPages=Math.ceil((data.length/parseInt(rows)));
    let trimmeData=data.slice(trimStart,trimEnd);
    // console.log(trimmeData);
    return {dataUser:trimmeData,pages:noOfPages}

}

//To render page buttons dynamically
function pageButtons(pages){

    
    if(state.page<=0)
    {
        state.page=1;
    }
    if(state.page>=pages)
    {
        state.page=parseInt(pages);
    } 

    let maxleft=(parseInt(state.page)-Math.floor(parseInt(state.window/2)));
    let maxright=(parseInt(state.page)+Math.floor(parseInt(state.window/2)));
  

    if(maxleft<=0)
    {
        maxleft=1;
        maxright=state.window;
    }
    if(maxright>pages)
    {
        maxright=pages;
        maxleft=pages-(state.window-1);

        if(maxleft<=0)
        {
            maxleft=1;
        }
    }
    state.btleft=maxleft;
    state.btright=maxright;
  

    let wrapper=document.getElementById('pagination-wrapper');
    
    wrapper.innerHTML="";
    for(let i=maxleft;i<=maxright;i++)
    {
        if(i===parseInt(state.page))
        wrapper.innerHTML+=`<button class="btn" data-bt-active=true data-page=${i}>${i}</button>`;
        else
        wrapper.innerHTML+=`<button class="btn" data-bt-active=false data-page=${i}>${i}</button>`;
    }
   
    
    let btn=document.createElement('button');
    btn.setAttribute('class','right btn');
    btn.innerHTML=`>`;
   
    let btn1=document.createElement('button');
    btn1.setAttribute('class','left btn');
    btn1.setAttribute('id','')
    btn1.innerHTML=`&#60;`
  
    let btFirst=document.createElement('button');
    btFirst.setAttribute('class','left-first btn');
    btFirst.setAttribute('data-left-first','true');
    btFirst.innerHTML=`&#60;&#60;`

    let btLast=document.createElement('button');
    btLast.setAttribute('class','right-last btn');
    btLast.setAttribute('data-right-first','true');
    btLast.setAttribute('data-page',pages);
    btLast.innerHTML=`&#x226B;`
    wrapper.prepend(btn1);
    wrapper.prepend(btFirst);
    wrapper.append(btn);
    wrapper.append(btLast);

    let buttons= document.querySelectorAll('.btn');
    buttons.forEach(bt=>{
        bt.addEventListener('click',handlePageBtClick);
    })

}

//Handle button click
function handlePageBtClick(e)
{
    const target=e.target;
    const button=document.querySelector(`[data-bt-active="true"]`);
    const pageNo=button.dataset.page;
    if(target.classList.contains('left-first'))
    {
        state.page=1;
        button.dataset.btActive=false;
    }
    else if(target.classList.contains('right-last'))
    {
        const pageNo=target.dataset.page;
        state.page=parseInt(pageNo);
        button.dataset.btActive=false;

    }
    else if(target.classList.contains('left'))
    {
        if((parseInt(pageNo)-1)<=0)
        {
            state.page=1;
        }
        else
        state.page=parseInt(pageNo)-1 ;
        button.dataset.btActive=false;
    }
    else if(target.classList.contains('right'))
    {
        if((parseInt(pageNo)+1)>state.totalPages)
        {
            state.page=state.totalPages;
        }
        else
        state.page=parseInt(pageNo)+1 ;
        button.dataset.btActive=false;
    }
    else{
        console.log('called');
        const pageNo=target.dataset.page;
        state.page=parseInt(pageNo);
        document.querySelector(`[data-bt-active=true]`).dataset.btActive=false;
        if(state.filteredData.length===0 || document.querySelector('#add').value==='')
        {
            renderList(list,false);
            return;
        }
        else{
            renderList(state.filteredData,false);
            return;
        }
    }
    
    if(state.filteredData.length===0 || document.querySelector('#add').value==='')
    {
        renderList(list);
    }
    else{
        renderList(state.filteredData);
    }
    
    
}
//render list and display it on DOM
function renderList(dataUsers)
{

    let data= pagination(dataUsers,state.page,state.rows);
    if(state.totalPages===0)
    {
        state.totalPages=data.pages;
    }

    pageButtons(data.pages);

    dataUsers=data.dataUser;
    listUl.innerHTML='';
    for(let i=0;i<dataUsers.length;i++)
    {   
        createDom(dataUsers[i]);
    }
    const handleUsers=document.querySelectorAll('.user-operation'); 
    handleUsers.forEach(user=>{
        user.addEventListener('click',handleUserOperations);
    })
}
//Create DOM 
function createDom(item)
{
    const liView=document.createElement('li');
    liView.setAttribute('data-li-id-view',item.id);
    liView.setAttribute('data-active',true);
    liView.innerHTML=`<div><input type="checkbox" data-checkbox-id=${item.id}></div><div data-view-name-id=${item.id}>${item.name}</div><div class="email-cell" data-view-email-id=${item.id}>${item.email}</div><div  data-view-role-id=${item.id}>${item.role}</div>
    <div class='user-operation'><i class="fas fa-user-edit edit-user" data-id=${item.id}></i>&nbsp;&nbsp;&nbsp;<i class="fas fa-user-times delete-user " data-id=${item.id}></i></div>`;
    const liEdit=document.createElement('li');
    liEdit.setAttribute('data-active',false);
    liEdit.setAttribute('data-li-id-edit',item.id);
    liEdit.innerHTML = `<div><input class="input" type="checkbox" data-checkbox-id=${item.id}></div>
                          <div><input class="input" type="text" data-edit-name-id=${item.id} value="${item.name}" ></div>
                         <div><input class="input email-cell" type="email" data-edit-email-id=${item.id}  value="${item.email}"></div>
                        <div>
                        <select name="" class="drp-dwn" id="role" data-edit-role-id=${item.id}>
                            <option value="0">member</option>
                            <option value="1">admin</option>
                        </select>
                        </div>
                        <div class='user-operation'><i class="far fa-save save-user" data-id=${item.id}></i></div>`;        
    listUl.appendChild(liView);
    listUl.appendChild(liEdit);
}
//Handle user operations: update delete save
function handleUserOperations(e)
{
    const target=e.target;
    const userId=parseInt(target.dataset.id);
    if(target.classList.contains('delete-user'))
    {
        const li=document.querySelector(`[data-li-id-view="${userId}"]`);
        li.remove();
        list.splice(userId-1,1);
        // listUl.removeChild()
    }
    if(target.classList.contains('edit-user'))
    {
     
        handleEditUser(userId);
    }
    if(target.classList.contains('save-user'))
    {
     
        handleSaveUser(userId);
    }

}
//Have save functionality of each user
function handleSaveUser(userId)
{
    const liEdit=document.querySelector(`[data-li-id-edit="${userId}"]`);
    let liEditChildren=liEdit.children;
    const email=liEditChildren[1].firstChild.value;

    const name=liEditChildren[2].firstChild.value;
    const e=liEditChildren[3].firstElementChild;
    const role=e.options[e.selectedIndex].text;
    if(email=="")
    {
        alert('it cant be empty');
        return;
    
    }
    if(name=="")
    {
        alert("name can not be empty");
        return;
    }
    const liView=document.querySelector(`[data-li-id-view="${userId}"]`);
    liViewChildren=liView.children;
    liViewChildren[1].innerHTML=email;
    liViewChildren[2].innerHTML=name;
    liViewChildren[3].innerHTML=role;
    list[userId-1].email=email;
    list[userId-1].role=role;
    list[userId-1].name=name;

    liView.dataset.active=true;
    liEdit.dataset.active=false;
}
//Handle edit functionality of each user
function handleEditUser(userId)
{
  
    
    const liEdit=document.querySelector(`[data-li-id-edit="${userId}"]`);
    const liView=document.querySelector(`[data-li-id-view="${userId}"]`);
    console.log(liView)
    console.log(liView.dataset.active);
    liView.dataset.active=false;
    liEdit.dataset.active=true;

    liEdit.data

    // console.log(li);
}
//Handle deleting mutilple users
function handleDeleteMany(e)
{
  
    const items=document.querySelectorAll('.list-details input[type=checkbox]');
    
    let isChecked=false;
     let i=0;
     while(i<items.length)
     {
         if(items[i].checked)
         {
            const userId=items[i].dataset.checkboxId;
            document.querySelector(`[data-li-id-edit="${userId}"]`).remove();
            document.querySelector(`[data-li-id-view="${userId}"]`).remove();
            list.splice(userId-1,1);
            i+=2;
            isChecked=true;
         }
         else{
            i+=2;
         }
     }
     if(!isChecked)
     {
            showNotification("Please select the items to delete");
            return;
        
     }
    document.querySelector('#checkAll').firstElementChild.checked=false;
    renderList(list);
   
    showNotification("selected items deleted successfully");
}
//select multiple items on selecting check box
function handleCheckEvent(e)
{
    const target=e.target;
    if(target.checked)
    {
        let listDetails=document.querySelector('.list-details');
        let listDetailsChildren=listDetails.children;
        //console.log(listDetailsChildren);
        for(let i=0;i<listDetailsChildren.length;i++)
        {
            listDetailsChildren[i].children[0].firstElementChild.checked=true;
            
        }
    }
    else{
        let listDetails=document.querySelector('.list-details');
        let listDetailsChildren=listDetails.children;
        //console.log(listDetailsChildren);
        for(let i=0;i<listDetailsChildren.length;i++)
        {
            listDetailsChildren[i].children[0].firstElementChild.checked=false;
            
        }
    }
  
}
//display alert message
function showNotification(msg)
{
    alert(msg);
}
//Handle the user search based on name email or role
function handleSearchEvent(e)
{
    //console.log("called");
    if(e.target.value=='')
    {
        renderList(list);
    }
    if(e.key==='Enter')
    {
        const text=e.target.value;
        console.log(text);
        if(text=='')
        {
            showNotification("search text can't be empty");
            renderList(list);
            return;
        }
        else{

            let newList=list.filter( item =>{
                if(item.name.toLowerCase().includes(text))
                {
                    return item;
                }
                else if(item.email.includes(text))
                {
                    return item;
                }
                else if(item.role.toLowerCase().includes(text))
                {
                    return item;
                }
            })
        console.log(newList);
          state.filteredData=newList;
          renderList(newList);
        }
    }
}
//Intialize application
function intializeApp()
{
    const deleteButton=document.getElementById('deleteSelected');
    const checkAllButton=document.querySelector('#checkAll');

    deleteButton.addEventListener('click',handleDeleteMany);
    checkAllButton.addEventListener('click',handleCheckEvent);
    searchTask.addEventListener('keyup',handleSearchEvent);
    getData();

}
intializeApp();


