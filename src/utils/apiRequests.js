import { jwtDecode } from "jwt-decode";
import { getStorage as getStorageValue } from 'minimal-shared/utils';

import axios, { endpoints } from 'src/lib/axios';


export async function getParametricaByAcronym(tipoParam) {

  const baseURL = import.meta.env.VITE_APP_BACK_URL;

  const array = [];

  await axios.get(`${baseURL}/Param/filter/${tipoParam}`).then((response) => {

    const decoded = jwtDecode(response.data);

    const decodedJSON = JSON.parse(decoded.data)

    decodedJSON.forEach(element => {






      const a = {
        id: element.id,
        name: element.name,
        code: element.param_code,
        identificador: element.id
      }

      array.push(a)




    });


  }).catch(error => {
    
  });

  return array

}

export async function getParametricaById(id) {

  const baseURL = import.meta.env.VITE_APP_BACK_URL;

  var array = {};

  await axios.get(`${baseURL}/Param/${id}`).then((response) => {



    const decoded = jwtDecode(response.data);

    const decodedJSON = JSON.parse(decoded.data)

    array = {
      id: decodedJSON.id,
      name: decodedJSON.name,
      code: decodedJSON.param_code

    }




  }).catch(error => {
    
  });

  return array

}

export function getParametricas() {

  const baseURL = import.meta.env.VITE_APP_BACK_URL;

  var array = [];

  axios.get(`${baseURL}/ParamType`).then((response) => {

    const decoded = jwtDecode(response.data);
    const decodedJSON = JSON.parse(decoded.data)


    decodedJSON.data.forEach(element => {





      var a = {
        id: decodedJSON.id,
        identificador: decodedJSON.id,
        name: decodedJSON.name,
        code: decodedJSON.code,
        acronym: decodedJSON.acronym
      }

      array.push(a)

    });



  }).catch(error => {
    
  });

  return array

}

export async function getTipoParametricaById(id) {

  const baseURL = import.meta.env.VITE_APP_BACK_URL;

  var array = null;

  await axios.get(`${baseURL}/ParamType/${id}`).then((response) => {


    const decoded = jwtDecode(response.data);
    const decodedJSON = JSON.parse(decoded.data)

    array = {
      id: decodedJSON.id,
      identificador: decodedJSON.id,
      name: decodedJSON.name,
      acronym: decodedJSON.acronym
    }







  }).catch(error => {
    
  });

  return array

}

export async function getPosicionesByElementType() {

  const baseURL = import.meta.env.VITE_APP_BACK_URL;


  var array = [];

  var requestResult1 = JSON.parse(getStorageValue('arrayTipoElemento'));
  var requestResult2 = JSON.parse(getStorageValue('arrayPosicionVertical'));
  var requestResult3 = JSON.parse(getStorageValue('arrayPosicionHorizontal'));

  await axios.get(`${baseURL}/PositionElementTypeConfig`).then((response) => {

    const decoded = jwtDecode(response.data);
    const decodedJSON = JSON.parse(decoded.data)




    decodedJSON.forEach(async element => {



      var positionVParamName = requestResult2.find(item => item.id === element.position_v_param_id).name
      var positionHParamName = requestResult3.find(item => item.id === element.position_h_param_id).name
      var supportElementTypeParam = requestResult1.find(item => item.id === element.support_element_type_param_id).name


      var a = {
        id: element.id,
        identificador: element.id,
        positionVParamId: element.position_v_param_id,
        positionHParamId: element.position_h_param_id,
        supportElementTypeParamId: element.support_element_type_param_id,
        positionVParamName: positionVParamName,
        positionHParamName: positionHParamName,
        supportElementTypeParamName: supportElementTypeParam

      }

      array.push(a)

    });



  }).catch(error => {
    
  });

  return array

}

export async function getPosicionesByElementTypeId(id) {

  const baseURL = import.meta.env.VITE_APP_BACK_URL;

  const parametricas = JSON.parse(getStorageValue('arrayParam'));
  const tipoElemento = parametricas.find(item => item.acronym === "TIPO_ELEMENTO").id;
  const posicionVertical = parametricas.find(item => item.acronym === "POSICION_VERTICAL").id;
  const posicionHorizontal = parametricas.find(item => item.acronym === "POSICION_HORIZONTAL").id;
  var requestResult1 = await getParametricaByAcronym(tipoElemento);
  var requestResult2 = await getParametricaByAcronym(posicionVertical);
  var requestResult3 = await getParametricaByAcronym(posicionHorizontal);

  var array = [];

  await axios.get(`${baseURL}/PositionElementTypeConfig/filter/${id}`).then((response) => {

    const decoded = jwtDecode(response.data);
    const decodedJSON = JSON.parse(decoded.data)

    decodedJSON.forEach(element => {


      var positionVParamName = requestResult2.find(item => item.id === element.position_v_param_id).name
      var positionHParamName = requestResult3.find(item => item.id === element.position_h_param_id).name
      var supportElementTypeParam = requestResult1.find(item => item.id === element.support_element_type_param_id).name


      var a = {
        id: element.id,
        identificador: element.id,
        positionVParamId: element.position_v_param_id,
        positionHParamId: element.position_h_param_id,
        supportElementTypeParamId: element.support_element_type_param_id,
        positionVParamName: positionVParamName,
        positionHParamName: positionHParamName,
        supportElementTypeParamName: supportElementTypeParam

      }

      array.push(a)

    });



  }).catch(error => {
    
  });

  return array

}

export async function getSupporElementesById(id) {

  const baseURL = import.meta.env.VITE_APP_BACK_URL;

  var array = {}


  await axios.get(`${baseURL}/SupportElement/${id}`).then((response) => {



    const decoded = jwtDecode(response.data);
    const decodedJSON = JSON.parse(decoded.data)

    array = decodedJSON


  }).catch(error => {
    
  });

  return array

}



export async function getPosicionesById(id) {

  const baseURL = import.meta.env.VITE_APP_BACK_URL;

  var requestResult1 = JSON.parse(getStorageValue('arrayTipoElemento'));
  var requestResult2 = JSON.parse(getStorageValue('arrayPosicionVertical'));
  var requestResult3 = JSON.parse(getStorageValue('arrayPosicionHorizontal'));

  var array = null;

  await axios.get(`${baseURL}/PositionElementTypeConfig/${id}`).then((response) => {


    const decoded = jwtDecode(response.data);
    const decodedJSON = JSON.parse(decoded.data)


    var positionVParamName = requestResult2.find(item => item.id === decodedJSON.position_v_param_id).name
    var positionHParamName = requestResult3.find(item => item.id === decodedJSON.position_h_param_id).name
    var positionVParamCode = requestResult2.find(item => item.id === decodedJSON.position_v_param_id).code
    var positionHParamCode = requestResult3.find(item => item.id === decodedJSON.position_h_param_id).code
    var supportElementTypeParam = requestResult1.find(item => item.id === decodedJSON.support_element_type_param_id).name


    array = {
      id: decodedJSON.id,
      identificador: decodedJSON.id,
      positionVParamId: decodedJSON.position_v_param_id,
      positionHParamId: decodedJSON.position_h_param_id,
      supportElementTypeParamId: decodedJSON.support_element_type_param_id,
      positionVParamName: positionVParamName,
      positionHParamName: positionHParamName,
      positionVParamCode: positionVParamCode,
      positionHParamCode: positionHParamCode,
      supportElementTypeParamName: supportElementTypeParam

    }


  }).catch(error => {
    
  });

  return array

}


export async function getRoles() {

  const baseURL = import.meta.env.VITE_APP_BACK_URL;



  var array = [];

  await axios.get(`${baseURL}/Role`).then((response) => {

    const decoded = jwtDecode(response.data);
    const decodedJSON = JSON.parse(decoded.data)

    decodedJSON.forEach(element => {




      var a = {
        id: element.id,
        identificador: element.id,
        code_rol: element.code_rol,
        description: element.description
      }

      array.push(a)

    });



  }).catch(error => {
    
  });

  return array

}

export async function getUsuarios() {

  const baseURL = import.meta.env.VITE_APP_BACK_URL;


  const array = []


  await axios.get(`${baseURL}/User`).then((response) => {

    const decoded = jwtDecode(response.data);
    const decodedJSON = JSON.parse(decoded.data)
    const arrayPerfiles = JSON.parse(getStorageValue('arrayPerfilesParam'));




    decodedJSON.forEach(async element => {

      const perfilName = arrayPerfiles.find(item => item.id === element.profile_id)


      var a = {
        id: element.id,
        identificador: element.id,
        email: element.mail,
        name: element.name,
        perfil: element.profile_id,
        perfilName: perfilName.description
      }



      array.push(a)



    })




  }).catch(error => {
    
  });

  return array

}


export async function getPerfiles() {

  const baseURL = import.meta.env.VITE_APP_BACK_URL;



  var array = [];

  await axios.get(`${baseURL}/Profile`).then((response) => {

    const decoded = jwtDecode(response.data);
    const decodedJSON = JSON.parse(decoded.data)

    decodedJSON.forEach(element => {

      var a = {
        id: element.id,
        identificador: element.id,
        code_profile: element.code_profile,
        description: element.description,
        roles: element.roles
      }

      array.push(a)

    });



  }).catch(error => {
    
  });

  return array

}

export async function getRolById(id) {

  const baseURL = import.meta.env.VITE_APP_BACK_URL;

  var array = {};

  await axios.get(`${baseURL}/Role/${id}`).then((response) => {



    const decoded = jwtDecode(response.data);
    const decodedJSON = JSON.parse(decoded.data)


    array = {
      id: decodedJSON.id,
      identificador: decodedJSON.id,
      code_role: decodedJSON.code_rol,
      name: decodedJSON.description

    }




  }).catch(error => {
    
  });

  return array

}

export async function getPerfilById(id) {

  const baseURL = import.meta.env.VITE_APP_BACK_URL;

  var array = {};

  await axios.get(`${baseURL}/Profile/${id}`).then(async (response) => {



    const decoded = jwtDecode(response.data);
    const decodedJSON = JSON.parse(decoded.data)

    await axios.get(`${baseURL}/Profile/${id}/roles`).then((response2) => {


      const decoded2 = jwtDecode(response2.data);
      const decodedJSON2 = JSON.parse(decoded2.data)

      const roles = [];

      decodedJSON2.forEach(element2 => {

        roles.push(element2.RoleId)
      });



      array = {
        id: decodedJSON.id,
        identificador: decodedJSON.id,
        code_profile: decodedJSON.code_profile,
        description: decodedJSON.description,
        items: roles

      }

    }).catch(error => {
      
    });


  }).catch(error => {
    
  });

  return array

}


export async function getUsuarioById(id) {

  const baseURL = import.meta.env.VITE_APP_BACK_URL;

  var array = {};

  await axios.get(`${baseURL}/User/${id}`).then((response) => {



    const decoded = jwtDecode(response.data);
    const decodedJSON = JSON.parse(decoded.data)




    array = {
      id: decodedJSON.id,
      name: decodedJSON.name,
      email: decodedJSON.mail,
      perfil: decodedJSON.profile_id

    }




  }).catch(error => {
    
  });

  return array

}

export async function getUsuarioByEmail(email) {

  const baseURL = import.meta.env.VITE_APP_BACK_URL;

  var array = {};

  await axios.get(`${baseURL}/User/search/email/${email}`).then((response) => {



    const decoded = jwtDecode(response.data);
    const decodedJSON = JSON.parse(decoded.data)



    array = {
      id: decodedJSON[0].id,
      name: decodedJSON[0].name,
      email: decodedJSON[0].mail,
      perfil: decodedJSON[0].profile_id

    }




  }).catch(error => {
    
  });

  return array

}



export async function getMateriales() {

  const baseURL = import.meta.env.VITE_APP_BACK_URL;

  var requestResult1 = JSON.parse(getStorageValue('arrayTipoMaterial'));
  var requestResult2 = JSON.parse(getStorageValue('arrayUnidadMedida'));
  var requestResult3 = JSON.parse(getStorageValue('arrayTipoElemento'));

  

  var array = [];

  await axios.get(`${baseURL}/Material`).then((response) => {

    const decoded = jwtDecode(response.data);
    const decodedJSON = JSON.parse(decoded.data)

    decodedJSON.forEach(element => {


      

      var materialTypeParamName = requestResult1.find(item => item.id === element.material_type_param_id).name
      var unidadMedidaParamName = requestResult2.find(item => item.id === element.unit_measure_param_id).name
      var tipoElementoParamName = requestResult3.find(item => item.id === element.element_type_param_id).name

      var a = {
        id: element.id,
        description: element.description,
        material_code: element.material_code,
        material_type_param_id: element.material_type_param_id,
        unit_measure_param_id: element.unit_measure_param_id,
        element_type_param_id: element.element_type_param_id,
        materialTypeParamName: materialTypeParamName,
        unidadMedidaParamName: unidadMedidaParamName,
        tipoElementoParamName: tipoElementoParamName
      }

      array.push(a)

    });



  }).catch(error => {
    
  });

  return array

}


export async function getMaterialById(id) {

  const baseURL = import.meta.env.VITE_APP_BACK_URL;
  var requestResult1 = JSON.parse(getStorageValue('arrayTipoMaterial'));
  var requestResult2 = JSON.parse(getStorageValue('arrayUnidadMedida'));

  var requestResult3 = JSON.parse(getStorageValue('arrayTipoElemento'));



  var array = null;

  await axios.get(`${baseURL}/Material/${id}`).then((response) => {

    const decoded = jwtDecode(response.data);
    const decodedJSON = JSON.parse(decoded.data)

    var materialTypeParamName = requestResult1.find(item => item.id === decodedJSON.material_type_param_id).name
    var unidadMedidaParamName = requestResult2.find(item => item.id === decodedJSON.unit_measure_param_id).name
    var tipoElementoParamName = requestResult3.find(item => item.id === decodedJSON.element_type_param_id).name

    array = {
      id: decodedJSON.id,
      description: decodedJSON.description,
      material_code: decodedJSON.material_code,
      material_type_param_id: decodedJSON.material_type_param_id,
      element_type_param_id: decodedJSON.element_type_param_id,
      unit_measure_param_id: decodedJSON.unit_measure_param_id,
      materialTypeParamName: materialTypeParamName,
      unidadMedidaParamName: unidadMedidaParamName,
      tipoElementoParamName: tipoElementoParamName
    }



  }).catch(error => {
    
  });

  return array

}


export async function getLineas() {

  const baseURL = import.meta.env.VITE_APP_BACK_URL;

  const parametricas = JSON.parse(getStorageValue('arrayParam'));

  
  const voltaje = parametricas.find(item => item.acronym === "VOLTAJE").id;
  var requestResult1 = await getParametricaByAcronym(voltaje);


  var array = [];

  await axios.get(`${baseURL}/TransmissionLine`).then((response) => {

    const decoded = jwtDecode(response.data);
    const decodedJSON = JSON.parse(decoded.data)

    decodedJSON.forEach(element => {



      var voltajeParamName = requestResult1.find(item => item.id === element.voltage_param_id).name

      var a = {
        id: element.id,
        number_line: element.number_line,
        voltaje_param_id: element.voltage_param_id,
        voltajeParamName: voltajeParamName,
        pendientes: element.status_element_param_id
      }

      array.push(a)

    });



  }).catch(error => {
    
  });

  return array

}


export async function getLineasById(id) {

  const baseURL = import.meta.env.VITE_APP_BACK_URL;
  const parametricas = JSON.parse(getStorageValue('arrayParam'));
  const voltaje = parametricas.find(item => item.acronym === "VOLTAJE").id;
  var requestResult1 = await getParametricaByAcronym(voltaje);


  var array = null;

  await axios.get(`${baseURL}/TransmissionLine/${id}`).then((response) => {

    const decoded = jwtDecode(response.data);
    const decodedJSON = JSON.parse(decoded.data)

    var voltajeParamName = requestResult1.find(item => item.id === decodedJSON.voltage_param_id).name

    array = {
      id: decodedJSON.id,
      number_line: decodedJSON.number_line,
      voltaje_param_id: decodedJSON.voltage_param_id,
      voltajeParamName: voltajeParamName,
    }



  }).catch(error => {
    
  });

  return array

}


export async function getApoyos() {

  const baseURL = import.meta.env.VITE_APP_BACK_URL;

  const parametricas = JSON.parse(getStorageValue('arrayParam'));
  const arrayAtmosfera = JSON.parse(getStorageValue('arrayAtmosfera'));
  const arrayVanoEspecial = JSON.parse(getStorageValue('arrayVanoEspecial'));
  const arrayTipoApoyo = JSON.parse(getStorageValue('arrayTipoApoyo'));
  const arrayFuncionApoyo = JSON.parse(getStorageValue('arrayFuncionApoyo'));


  var array = [];

  await axios.get(`${baseURL}/SupportStructure`).then(async (response) => {

    const decoded = jwtDecode(response.data);
    const decodedJSON = JSON.parse(decoded.data)

    

    const lineas = await getLineas();

    

    for (var aa = 0; aa < decodedJSON.length; aa++) {

      var element = decodedJSON[aa];

      const atmosferaCorrosivaParamName = arrayAtmosfera.find(item => item.id === element.corrosive_atmosphere_param_id).name
      const funcionApoyoParamName = arrayFuncionApoyo.find(item => item.id === element.function_param_id).name
      const tipoApoyoParamName = arrayTipoApoyo.find(item => item.id === element.support_structure_type_param_id).name
      const vanoEspecialParamName = arrayVanoEspecial.find(item => item.id === element.special_span_param_id).name


      const arrayLines = []

      var arrayLineasA = element.structure_lines;
      var lineasNumberString = "";



      for (var line = 0; line < arrayLineasA.length; line++) {

        var element2 = arrayLineasA[line]

        var linea = lineas.find(item => item.id === element2.transmission_line_id)

        lineasNumberString += linea.number_line + "/"

        arrayLines.push(element2.transmission_line_id);

      }

      var numerosLinea = lineasNumberString.substring(0, lineasNumberString.length - 1)

      var a = {
        id: element.id,
        transmission_line_id: element.transmission_line_id,
        internal_code: element.internal_code,
        sap_number: element.sap_number,
        function_param_id: element.function_param_id,
        support_structure_type_param_id: element.support_structure_type_param_id,
        special_span_param_id: element.special_span_param_id,
        corrosive_atmosphere_param_id: element.corrosive_atmosphere_param_id,
        funcionApoyoParamName: funcionApoyoParamName,
        tipoApoyoParamName: tipoApoyoParamName,
        vanoEspecialParamName: vanoEspecialParamName,
        atmosferaCorrosivaParamName: atmosferaCorrosivaParamName,
        structure_line_id: arrayLines,
        lineaNumber: numerosLinea
      }


      array.push(a)

    }

    


  }).catch(error => {
    
  });

  return array

}


export async function getApoyosById(id) {

  const baseURL = import.meta.env.VITE_APP_BACK_URL;
  const parametricas = JSON.parse(getStorageValue('arrayParam'));

  const funcionApoyo = parametricas.find(item => item.acronym === "FUNCION_APOYO").id;
  const tipoApoyo = parametricas.find(item => item.acronym === "TIPO_APOYO").id;
  const vanoEspecial = parametricas.find(item => item.acronym === "VANO_ESPECIAL").id;
  const atmosferaCorrosiva = parametricas.find(item => item.acronym === "ATMOSFERA_CORROSIVA").id;
  var requestResult1 = await getParametricaByAcronym(funcionApoyo);
  var requestResult2 = await getParametricaByAcronym(tipoApoyo);
  var requestResult3 = await getParametricaByAcronym(vanoEspecial);
  var requestResult4 = await getParametricaByAcronym(atmosferaCorrosiva);


  var array = null;

  await axios.get(`${baseURL}/SupportStructure/${id}`).then(async (response) => {

    const decoded = jwtDecode(response.data);
    const decodedJSON = JSON.parse(decoded.data)

    var funcionApoyoParamName = requestResult1.find(item => item.id === decodedJSON.function_param_id).name
    var tipoApoyoParamName = requestResult2.find(item => item.id === decodedJSON.support_structure_type_param_id).name
    var vanoEspecialParamName = requestResult3.find(item => item.id === decodedJSON.special_span_param_id).name
    var atmosferaCorrosivaParamName = requestResult4.find(item => item.id === decodedJSON.corrosive_atmosphere_param_id).name

    const arrayLines = []

    var arrayLineasA = decodedJSON.structure_lines;

    for (var line = 0; line < arrayLineasA.length; line++) {

      var element2 = arrayLineasA[line]

      arrayLines.push(element2.transmission_line_id);



    }


    array = {
      id: decodedJSON.id,
      transmission_line_id: decodedJSON.transmission_line_id,
      internal_code: decodedJSON.internal_code,
      sap_number: decodedJSON.sap_number,
      function_param_id: decodedJSON.function_param_id,
      support_structure_type_param_id: decodedJSON.support_structure_type_param_id,
      special_span_param_id: decodedJSON.special_span_param_id,
      corrosive_atmosphere_param_id: decodedJSON.corrosive_atmosphere_param_id,
      funcionApoyoParamName: funcionApoyoParamName,
      tipoApoyoParamName: tipoApoyoParamName,
      vanoEspecialParamName: vanoEspecialParamName,
      atmosferaCorrosivaParamName: atmosferaCorrosivaParamName,
      lineaNumber: "",
      structure_line_id: arrayLines
    }

    


  }).catch(error => {
    
  });

  return array

}

export async function getApoyosByLinea(id) {

  const baseURL = import.meta.env.VITE_APP_BACK_URL;

  const parametricas = JSON.parse(getStorageValue('arrayParam'));
  const funcionApoyo = parametricas.find(item => item.acronym === "FUNCION_APOYO").id;
  const tipoApoyo = parametricas.find(item => item.acronym === "TIPO_APOYO").id;
  const vanoEspecial = parametricas.find(item => item.acronym === "VANO_ESPECIAL").id;
  const atmosferaCorrosiva = parametricas.find(item => item.acronym === "ATMOSFERA_CORROSIVA").id;
  var requestResult1 = await getParametricaByAcronym(funcionApoyo);
  var requestResult2 = await getParametricaByAcronym(tipoApoyo);
  var requestResult3 = await getParametricaByAcronym(vanoEspecial);
  var requestResult4 = await getParametricaByAcronym(atmosferaCorrosiva);


  var array = [];

  await axios.get(`${baseURL}/SupportStructure/filter/${id}`).then((response) => {

    const decoded = jwtDecode(response.data);
    const decodedJSON = JSON.parse(decoded.data)

    decodedJSON.forEach(async element => {


      var funcionApoyoParamName = requestResult1.find(item => item.id === element.function_param_id).name
      var tipoApoyoParamName = requestResult2.find(item => item.id === element.support_structure_type_param_id).name
      var vanoEspecialParamName = requestResult3.find(item => item.id === element.special_span_param_id).name
      var atmosferaCorrosivaParamName = requestResult4.find(item => item.id === element.corrosive_atmosphere_param_id).name

      await axios.get(`${baseURL}/TransmissionLine/${element.transmission_line_id}`).then((response2) => {

        const decoded2 = jwtDecode(response2.data);
        const decodedJSON2 = JSON.parse(decoded2.data)

        var a = {
          id: element.id,
          transmission_line_id: element.transmission_line_id,
          internal_code: element.internal_code,
          sap_number: element.sap_number,
          function_param_id: element.function_param_id,
          support_structure_type_param_id: element.support_structure_type_param_id,
          special_span_param_id: element.special_span_param_id,
          corrosive_atmosphere_param_id: element.corrosive_atmosphere_param_id,
          funcionApoyoParamName: funcionApoyoParamName,
          tipoApoyoParamName: tipoApoyoParamName,
          vanoEspecialParamName: vanoEspecialParamName,
          atmosferaCorrosivaParamName: atmosferaCorrosivaParamName,
          lineaNumber: decodedJSON2.number_line
        }


        array.push(a)

      })

    })


  }).catch(error => {
    
  });

  return array

}

export async function getDesviacionByMaterialId(id) {

  const baseURL = import.meta.env.VITE_APP_BACK_URL;

  var array = {};

  await axios.get(`${baseURL}/MaterialDeviation/by-material-element/${id}`).then((response) => {



    const decoded = jwtDecode(response.data);
    const decodedJSON = JSON.parse(decoded.data)



    array = {
      id: decodedJSON[0].id,
      quantity_desv: decodedJSON[0].material_quantity,
      material_id_desv: decodedJSON[0].material_id,
      observaciones: decodedJSON[0].description

    }



  }).catch(error => {
    
  });

  return array

}
