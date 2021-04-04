<template>
  <div class="mainwrapper">
      <div class="menuline">
        <span>Ваш номер телефона:</span>
        <p>{{telNumber}}</p>
      </div>
      <div class="menuline">
        <span>Имя файла:</span>
        <p>{{fileName}}</p>
        <b-button @click="download" v-if="isDocToCheck">Загрузить файл</b-button>
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
    onEnd() {/* Событие окончания процесса рисования подписи */
      this.docChecked=true/* Тригер для отображения статуса документа на странице 2 или 3 стороны. Документ проверен или Подписи проверены*/
      this.$socket.sendObj({telNumber: this.telNumber})/* Отправляем на сервер данные о том кто проверил документ,что бы там пометить с сэмитить соотв. событие */
      this.$refs.signaturePad.lockSignaturePad()/* блокируем наш signaturePad */
    },
    download(){
      var xhr= new XMLHttpRequest();/* скачиваение файла который  проверяем */
      xhr.open('GET', '/download?file='+this.fileName)
      xhr.onreadystatechange=()=>{//(0 → 1 → 2 → 3 → … → 3 → 4)
        if(xhr.readyState!=4)return;
        if(xhr.status!=200) {
          alert(xhr.status+': '+xhr.statusText);// обработать ошибку
        }else{
          window.open('/download?file='+this.fileName)
        }
      } 
      xhr.send();
    }
  },
  computed:{

  },
  created(){
    /* после удачного логина получаем наш номер телефона из параметров url  */
    this.telNumber=this.$route.params.telNumber
    this.$options.sockets.onmessage = function(data){/* подписываемся на событие Подписи проверены и если они проверены,то отображаем соотв. элемент. */
      if (data.data=="Подписи проверены"){
        this.docChecked=false
        this.signsChecked=true
      }
    }
    let getDocs=()=>{
      /* функция получения документа на проверку.Делаем соотв. express POST запросс*/
      var xhr= new XMLHttpRequest();
      xhr.open('POST','/check',true);
      xhr.send(this.$route.params.formData)
      xhr.responseType="json"
      xhr.onreadystatechange=()=>{//(0 → 1 → 2 → 3 → … → 3 → 4)
        if(xhr.readyState!=4)return;
        if(xhr.status!=200) {
          alert(xhr.status+': '+xhr.statusText);// обработать ошибку
        }else if(xhr.response.isDocToCheck){
          /* Если ничего на проверку для нас нет. То рендерим соотв. элементы и через 3 секунды проверяем еще раз */
          this.fileName="Файлов для проверки нет"
          this.isDocToCheck=false
          setTimeout(getDocs,3000)
        }else{
          this.fileName=xhr.response.fileName/* Если есть что првоеряеть, то рендерим соотв. элементы */
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