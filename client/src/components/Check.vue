<template>
  <div class="mainwrapper">
      <div class="menuline">
        <span>Ваш номер телефона:</span>
        <p>{{telNumber}}</p>
      </div>
      <div class="menuline">
        <span>Имя файла:</span>
        <p>{{fileName}}</p>
        <b-button @click="download">Загрузить файл</b-button>
        <div v-if="isDocToCheck">
          <span>Поставьте подпись:</span>
          <VueSignaturePad
            id="signature" 
            width="200px" 
            height="200px" 
            ref="signaturePad"
            :options="{ onBegin, onEnd }"
            />
        </div>
        <b-button variant="success" disabled v-if="docChecked">Документ проверен</b-button>
        <b-button variant="warning" disabled v-if="signsChecked">Подписи проверены</b-button>
      </div>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
        telNumber:"",
        fileName:"",
        date:"",
        file:{},
        isDocToCheck:false,
        docChecked:false,
        signsChecked:false,
    }
  },
  methods: {
    onEnd() {
      console.log('=== End ===');
      this.docChecked=true
      this.$socket.sendObj({telNumber: this.telNumber})
      this.$refs.signaturePad.lockSignaturePad()
    },
    download(){
      var xhr= new XMLHttpRequest();
      xhr.open('GET','/download',true);
      xhr.send(this.fileName)
/*       xhr.onreadystatechange=()=>{//(0 → 1 → 2 → 3 → … → 3 → 4)
        if(xhr.readyState!=4)return;
        if(xhr.status!=200) {
          alert(xhr.status+': '+xhr.statusText);// обработать ошибку
        }else if(xhr.response.isDocToCheck){
          console.log('нет такого',xhr.response)
          this.fileName="Файлов для проверки нет"
          this.isDocToCheck=false
          setTimeout(getDocs,3000)
        }else{
          this.fileName=xhr.response.fileName
          console.log('все ок',xhr.response.fileName)
          this.isDocToCheck=true
        }
      }   */    
    }
  },
  computed:{

  },
  created(){
    this.telNumber=this.$route.params.telNumber
    
    this.$options.sockets.onmessage = function(data){
      console.log(data)
      if (data.data=="Подписи проверены"){
        this.docChecked=false
        this.signsChecked=true
      }
    }
    let getDocs=()=>{
      var xhr= new XMLHttpRequest();
      xhr.open('POST','/check',true);
      xhr.send(this.$route.params.formData)
      xhr.responseType="json"
      xhr.onreadystatechange=()=>{//(0 → 1 → 2 → 3 → … → 3 → 4)
        if(xhr.readyState!=4)return;
        if(xhr.status!=200) {
          alert(xhr.status+': '+xhr.statusText);// обработать ошибку
        }else if(xhr.response.isDocToCheck){
          console.log('нет такого',xhr.response)
          this.fileName="Файлов для проверки нет"
          this.isDocToCheck=false
          setTimeout(getDocs,3000)
        }else{
          this.fileName=xhr.response.fileName
          console.log('все ок',xhr.response.fileName)
          this.isDocToCheck=true
        }
      } 
    }
    getDocs()
  }
}
</script>

<style>
.mainwrapper{
  width: auto;
  height: 50vh;
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin:50px 50px 0px 50px; 
    border:2px solid #2d3436;
    background-color:#74b9ff ;
  border-radius:20px;
}
.previewBlock{
  width: calc(100vw - 200px);
}
.menuline{
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}
#signature{
  box-sizing: border-box;
  border:1px solid #96f6ce;
  border-radius: 5px;
  margin-bottom:15px ;
  background-color:#ffffff ;
}
</style>