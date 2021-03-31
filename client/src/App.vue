<template>
  <div id="app" >
    <div class="reg" v-if="visible">
      <b-tabs class="tabwrap" content-class="mt-3">
        <b-tab title="Добавить документ" active>
            <form class="form" name="upload" action="/check" method="POST" enctype="multipart/form-data">
              <div class="line">
                <label for="tel2">Второй проверяющий</label>
                <b-form-input name="tel2" type="text" id="tel2" v-model="tel2"></b-form-input>
              </div>
              <div class="line">
                <label for="tel3" >Третий проверяющий</label>
                <b-form-input name="tel3" type="text" id="tel3" v-model="tel3"></b-form-input>
              </div>
              <div class="line">
                <div>
                  <label for="date">Дата</label>
                  <b-form-input name="date" type="date" id="date" v-model="date"></b-form-input>
                </div>
                <div>
                  <label for="expire">Срок (мес.)</label>
                  <b-form-input name="expire" type="number" id="expire"  value="1" min="1" max="12" v-model="expire"></b-form-input>
                </div>
              </div>
              <div class="line">
                <b-col sm="7" id="fileInput">
                  <b-form-file
                    id="file"
                    name="file"
                    v-model="file"
                    :state="Boolean(file)"
                    placeholder="Choose a file or drop it here..."
                    drop-placeholder="Drop file here..."
                  ></b-form-file>
                </b-col>
                <b-button :disabled="disabled" @click="sign">{{buttonText}}</b-button>
              </div>
             
            </form>   
        </b-tab>
        <b-tab title="Войти по номеру">
          <form class="form" name="login" method="POST" enctype="multipart/form-data">
            <div class="line">
              <label for="telephone">Телефон</label>
                <b-form-input name="telNumber" v-model="telNumber" id="telephone" placeholder="Введите номер телефона" ></b-form-input>
            </div>
            <div class="buttonwrap">
              <b-button @click="login" variant="success">Вход</b-button>
            </div>
          </form>
        </b-tab>
      </b-tabs>
    </div>
    <router-view></router-view> 
  </div>
</template>

<script>
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

export default {
  data: function () {
    return {
        telNumber:"",
        file:"",
        visible:true,
        tel2:"",
        tel3:"",
        date:"",
        expire:"",
        buttonText:"Документ проверен",
        disabled:false
    }
  },
  methods:{
    login(){  
      if(this.telNumber){
        this.visible=!this.visible
        let formData = new FormData(document.forms.login)
        this.$router.push({ name: "check", params: { telNumber: this.telNumber,formData:formData}})     
      } else{
        alert('Введите номер телефона')
      }
    },
    sign(){
      if(!this.tel2 || !this.tel3 || !this.file || !this.date || !this.expire){
        alert("Заполните поля")
      }else if(this.tel2 == this.tel3){
        alert("Проверяющие должны быть разные")
      }else{
        if(this.buttonText=="Подписи проверены"){
          this.$socket.send("Подписи проверены")
          this.file=""
          this.tel2=""
          this.tel3=""
          this.expire=""
          this.date=""
          this.buttonText="Поставить подпись"
          this.disabled=false
        }
        let formData = new FormData(document.forms.upload)
        var xhr= new XMLHttpRequest();
        xhr.open('POST','/',true);
        xhr.send(formData);
        this.buttonText="Ожидаем проверки..."
        this.disabled=true
        xhr.onreadystatechange=function() {//(0 → 1 → 2 → 3 → … → 3 → 4)
            if(xhr.readyState!=4)return;
            if(xhr.status!=200) {
                alert(xhr.status+': '+xhr.statusText);// обработать ошибку
            }else {
                console.log("asd"+xhr.responseText); // вывести результат
            }
        }
      }
    }
  },
  created(){
    this.$options.sockets.onmessage = function(data){
      console.log(data)
      if (data.data=="Документ проверен"){
        console.log("Документ проверен,можно проверять подписи")
        this.buttonText="Подписи проверены"
        this.disabled=false
      }
    }
  }  

}
</script>

<style>
  body{
    background-color:#dfe6e9 ;
  }
  .reg{
    width: 500px;
    height: 400px;
    display: flex;
    justify-content: space-around;
    border:2px solid #2d3436;
    background-color:#74b9ff ;
    border-radius:20px;
    padding:20px;
    margin:150px auto
  }
  .line{
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 65px;
  }
  .line input{
    width: 206px;
    height: 30px;
  }
  .buttonwrap{
    height: 40px;
    display: flex;
    justify-content: center;
  }
  .tabwrap{
    width: 100%;
  }
  #date{
    width: 170px;
  }
  #file{
    width: 90%;
  }
  #expire{
    width: 70px
  }
  .form{
    display: flex;
    height: 280px;
    flex-direction: column;
    justify-content: space-between;
  }
  #fileInput{
    width: 10px;
    padding-left: 0px ;
  }
  li{
    width: 50%;
  }
</style>
