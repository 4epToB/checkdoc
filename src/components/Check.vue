<template>
  <div class="mainwrapper">
    <div class="leftBlock">
      <div class="menuline">
        <span>Ваш номер телефона:</span>
        <p>{{telNumber}}</p>
      </div>
      <div class="menuline">
        <span>Имя файла:</span>
        <p>{{fileName}}</p>
        <VueSignaturePad
          id="signature" 
          width="200px" 
          height="200px" 
          ref="signaturePad"
          :options="{ onBegin, onEnd }"
          />
        <b-button variant="success" disabled v-if="docChecked">Документ проверен</b-button>
        <b-button variant="warning" disabled v-if="signsChecked">Подписи проверены</b-button>
      </div>
    </div>
    <div class="previewBlock">
      {{file}}
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
    onBegin() {
      console.log('=== Begin ===');
    },
    onEnd() {
      console.log('=== End ===');
      this.docChecked=true
      var xhr= new XMLHttpRequest();
      xhr.open('POST','/checked',true);
      xhr.send(this.telNumber);
      console.log('Подпись поставлена',this.telNumber)
      xhr.onreadystatechange=()=>{//(0 → 1 → 2 → 3 → … → 3 → 4)
        if(xhr.readyState!=4)return;
        if(xhr.status!=200) {
          alert(xhr.status+': '+xhr.statusText);// обработать ошибку
        }else{
          this.isDocToCheck=false
          console.log('все ок',xhr.response)
        }
      }
    }
  },
  computed:{

  },
  created(){
    this.telNumber=this.$route.params.telNumber
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
        this.isDocToCheck=false
      }else{
        this.isDocToCheck=true
        this.fileName=xhr.response.fileName
        this.date=xhr.response.date
        console.log('все ок',xhr.response.fileName)
      }
    } 
  }
}
</script>

<style>
.mainwrapper{
  width: 100vw;
  height: 100vh;
  display: flex;
}
.leftBlock{
  width: 200px;
  border-right:2px solid #6a89cc;
  background-color:#38ada9 ;
  padding: 10px;
  display: flex;
  flex-direction: column;
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
  height: 65px;
}
#signature{
  box-sizing: border-box;
  border:1px solid #6a89cc;
  border-radius: 5px
}
</style>