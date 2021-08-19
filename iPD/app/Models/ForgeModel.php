<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
class ForgeModel extends Model
{
    protected $table = '';
    public function GetProjects()
    {
      $query = "SELECT * FROM tb_project";
      $data = DB::select($query);     
      return json_decode(json_encode($data),true);
    }
    
    public function GetItems()
    {
      $query = "SELECT * FROM tb_forge_item";
      $data = DB::select($query);     
      return json_decode(json_encode($data),true);
    }

    public function GetVersions()
    {
      $query = "SELECT item.name,vrs.* FROM tb_forge_version vrs 
                LEFT JOIN  tb_forge_item item  ON item.id = vrs.item_id";
      $data = DB::select($query);     
      return json_decode(json_encode($data),true);
    }
    
    public function GetItemsByProject($project)
    {
      $query = "SELECT ti.* FROM tb_forge_item ti
                LEFT JOIN tb_project tp ON tp.id = ti.project_id
                WHERE tp.name='$project'";
      $data = DB::select($query);     
      return json_decode(json_encode($data),true);
    }

    public function GetVersionsByProject($project)
    {
      $query = "SELECT item.name,vrs.* FROM tb_forge_version vrs 
                LEFT JOIN  tb_forge_item item  ON item.id = vrs.item_id
                LEFT JOIN tb_project tp ON tp.id = item.project_id
                WHERE tp.name = '$project'
                ORDER BY item.name,vrs.version_number DESC";
      $data = DB::select($query);     
      return json_decode(json_encode($data),true);
    }
    
    public function GetMaterailsByProject($project)
    {
      $query = "(SELECT material_name as name from tb_forge_column 
                LEFT JOIN  tb_forge_item item  ON item.id = item_id
                LEFT JOIN tb_project tp ON tp.id = item.project_id
                WHERE tp.name = '$project'
                GROUP BY material_name)
                UNION 
                (SELECT material_name as name from tb_forge_column_updated
                LEFT JOIN  tb_forge_item item  ON item.id = item_id
                LEFT JOIN tb_project tp ON tp.id = item.project_id
                WHERE tp.name = '$project'
                GROUP BY material_name)
                UNION 
                (SELECT material_name as name from tb_forge_beam
                LEFT JOIN  tb_forge_item item  ON item.id = item_id
                LEFT JOIN tb_project tp ON tp.id = item.project_id
                WHERE tp.name = '$project'
                GROUP BY material_name)
                UNION 
                (SELECT material_name as name from tb_forge_beam_updated
                LEFT JOIN  tb_forge_item item  ON item.id = item_id
                LEFT JOIN tb_project tp ON tp.id = item.project_id
                WHERE tp.name = '$project'
                GROUP BY material_name)
                UNION 
                (SELECT material_name as name from tb_forge_floor
                LEFT JOIN  tb_forge_item item  ON item.id = item_id
                LEFT JOIN tb_project tp ON tp.id = item.project_id
                WHERE tp.name = '$project'
                GROUP BY material_name)
                UNION 
                (SELECT material_name as name from tb_forge_floor_updated
                LEFT JOIN  tb_forge_item item  ON item.id = item_id
                LEFT JOIN tb_project tp ON tp.id = item.project_id
                WHERE tp.name = '$project'
                GROUP BY material_name)
                UNION 
                (SELECT material_name as name from tb_forge_wall
                LEFT JOIN  tb_forge_item item  ON item.id = item_id
                LEFT JOIN tb_project tp ON tp.id = item.project_id
                WHERE tp.name = '$project'
                GROUP BY material_name)
                UNION 
                (SELECT material_name as name from tb_forge_wall_updated
                LEFT JOIN  tb_forge_item item  ON item.id = item_id
                LEFT JOIN tb_project tp ON tp.id = item.project_id
                WHERE tp.name = '$project'
                GROUP BY material_name)
                UNION 
                (SELECT material_name as name from tb_forge_foundation
                LEFT JOIN  tb_forge_item item  ON item.id = item_id
                LEFT JOIN tb_project tp ON tp.id = item.project_id
                WHERE tp.name = '$project'
                GROUP BY material_name)
                UNION 
                (SELECT material_name as name from tb_forge_foundation_updated
                LEFT JOIN  tb_forge_item item  ON item.id = item_id
                LEFT JOIN tb_project tp ON tp.id = item.project_id
                WHERE tp.name = '$project'
                GROUP BY material_name)";
      $data = DB::select($query);     
      return json_decode(json_encode($data),true);
    }

    public function GetWorksetsByProject($project)
    {
      $query = "(SELECT workset as name from tb_forge_column 
                LEFT JOIN  tb_forge_item item  ON item.id = item_id
                LEFT JOIN tb_project tp ON tp.id = item.project_id
                WHERE tp.name = '$project'
                GROUP BY workset)
                UNION 
                (SELECT workset as name from tb_forge_column_updated
                LEFT JOIN  tb_forge_item item  ON item.id = item_id
                LEFT JOIN tb_project tp ON tp.id = item.project_id
                WHERE tp.name = '$project'
                GROUP BY workset)
                UNION 
                (SELECT workset as name from tb_forge_beam
                LEFT JOIN  tb_forge_item item  ON item.id = item_id
                LEFT JOIN tb_project tp ON tp.id = item.project_id
                WHERE tp.name = '$project'
                GROUP BY workset)
                UNION 
                (SELECT workset as name from tb_forge_beam_updated
                LEFT JOIN  tb_forge_item item  ON item.id = item_id
                LEFT JOIN tb_project tp ON tp.id = item.project_id
                WHERE tp.name = '$project'
                GROUP BY workset)
                UNION 
                (SELECT workset as name from tb_forge_floor
                LEFT JOIN  tb_forge_item item  ON item.id = item_id
                LEFT JOIN tb_project tp ON tp.id = item.project_id
                WHERE tp.name = '$project'
                GROUP BY workset)
                UNION 
                (SELECT workset as name from tb_forge_floor_updated
                LEFT JOIN  tb_forge_item item  ON item.id = item_id
                LEFT JOIN tb_project tp ON tp.id = item.project_id
                WHERE tp.name = '$project'
                GROUP BY workset)
                UNION 
                (SELECT workset as name from tb_forge_wall
                LEFT JOIN  tb_forge_item item  ON item.id = item_id
                LEFT JOIN tb_project tp ON tp.id = item.project_id
                WHERE tp.name = '$project'
                GROUP BY workset)
                UNION 
                (SELECT workset as name from tb_forge_wall_updated
                LEFT JOIN  tb_forge_item item  ON item.id = item_id
                LEFT JOIN tb_project tp ON tp.id = item.project_id
                WHERE tp.name = '$project'
                GROUP BY workset)
                UNION 
                (SELECT workset as name from tb_forge_foundation
                LEFT JOIN  tb_forge_item item  ON item.id = item_id
                LEFT JOIN tb_project tp ON tp.id = item.project_id
                WHERE tp.name = '$project'
                GROUP BY workset)
                UNION 
                (SELECT workset as name from tb_forge_foundation_updated
                LEFT JOIN  tb_forge_item item  ON item.id = item_id
                LEFT JOIN tb_project tp ON tp.id = item.project_id
                WHERE tp.name = '$project'
                GROUP BY workset)";
      $data = DB::select($query);     
      return json_decode(json_encode($data),true);
    }

    public function GetLevelsByProject($project)
    {
      $query = "(SELECT level as name from tb_forge_column 
                LEFT JOIN  tb_forge_item item  ON item.id = item_id
                LEFT JOIN tb_project tp ON tp.id = item.project_id
                WHERE tp.name = '$project'
                GROUP BY level)
                UNION 
                (SELECT level as name from tb_forge_column_updated
                LEFT JOIN  tb_forge_item item  ON item.id = item_id
                LEFT JOIN tb_project tp ON tp.id = item.project_id
                WHERE tp.name = '$project'
                GROUP BY level)
                UNION 
                (SELECT level as name from tb_forge_beam
                LEFT JOIN  tb_forge_item item  ON item.id = item_id
                LEFT JOIN tb_project tp ON tp.id = item.project_id
                WHERE tp.name = '$project'
                GROUP BY level)
                UNION 
                (SELECT level as name from tb_forge_beam_updated
                LEFT JOIN  tb_forge_item item  ON item.id = item_id
                LEFT JOIN tb_project tp ON tp.id = item.project_id
                WHERE tp.name = '$project'
                GROUP BY level)
                UNION 
                (SELECT level as name from tb_forge_floor
                LEFT JOIN  tb_forge_item item  ON item.id = item_id
                LEFT JOIN tb_project tp ON tp.id = item.project_id
                WHERE tp.name = '$project'
                GROUP BY level)
                UNION 
                (SELECT level as name from tb_forge_floor_updated
                LEFT JOIN  tb_forge_item item  ON item.id = item_id
                LEFT JOIN tb_project tp ON tp.id = item.project_id
                WHERE tp.name = '$project'
                GROUP BY level)
                UNION 
                (SELECT level as name from tb_forge_wall
                LEFT JOIN  tb_forge_item item  ON item.id = item_id
                LEFT JOIN tb_project tp ON tp.id = item.project_id
                WHERE tp.name = '$project'
                GROUP BY level)
                UNION 
                (SELECT level as name from tb_forge_wall_updated
                LEFT JOIN  tb_forge_item item  ON item.id = item_id
                LEFT JOIN tb_project tp ON tp.id = item.project_id
                WHERE tp.name = '$project'
                GROUP BY level)
                UNION 
                (SELECT level as name from tb_forge_foundation
                LEFT JOIN  tb_forge_item item  ON item.id = item_id
                LEFT JOIN tb_project tp ON tp.id = item.project_id
                WHERE tp.name = '$project'
                GROUP BY level)
                UNION 
                (SELECT level as name from tb_forge_foundation_updated
                LEFT JOIN  tb_forge_item item  ON item.id = item_id
                LEFT JOIN tb_project tp ON tp.id = item.project_id
                WHERE tp.name = '$project'
                GROUP BY level)";
      $data = DB::select($query);     
      return json_decode(json_encode($data),true);
    }

    public function GetFamilyNamesByProject($project)
    {
      $query = "(SELECT family_name as name from tb_forge_column 
                LEFT JOIN  tb_forge_item item  ON item.id = item_id
                LEFT JOIN tb_project tp ON tp.id = item.project_id
                WHERE tp.name = '$project'
                GROUP BY family_name)
                UNION 
                (SELECT family_name as name from tb_forge_column_updated
                LEFT JOIN  tb_forge_item item  ON item.id = item_id
                LEFT JOIN tb_project tp ON tp.id = item.project_id
                WHERE tp.name = '$project'
                GROUP BY family_name)
                UNION 
                (SELECT family_name as name from tb_forge_beam
                LEFT JOIN  tb_forge_item item  ON item.id = item_id
                LEFT JOIN tb_project tp ON tp.id = item.project_id
                WHERE tp.name = '$project'
                GROUP BY family_name)
                UNION 
                (SELECT family_name as name from tb_forge_beam_updated
                LEFT JOIN  tb_forge_item item  ON item.id = item_id
                LEFT JOIN tb_project tp ON tp.id = item.project_id
                WHERE tp.name = '$project'
                GROUP BY family_name)
                UNION 
                (SELECT family_name as name from tb_forge_floor
                LEFT JOIN  tb_forge_item item  ON item.id = item_id
                LEFT JOIN tb_project tp ON tp.id = item.project_id
                WHERE tp.name = '$project'
                GROUP BY family_name)
                UNION 
                (SELECT family_name as name from tb_forge_floor_updated
                LEFT JOIN  tb_forge_item item  ON item.id = item_id
                LEFT JOIN tb_project tp ON tp.id = item.project_id
                WHERE tp.name = '$project'
                GROUP BY family_name)
                UNION 
                (SELECT family_name as name from tb_forge_wall
                LEFT JOIN  tb_forge_item item  ON item.id = item_id
                LEFT JOIN tb_project tp ON tp.id = item.project_id
                WHERE tp.name = '$project'
                GROUP BY family_name)
                UNION 
                (SELECT family_name as name from tb_forge_wall_updated
                LEFT JOIN  tb_forge_item item  ON item.id = item_id
                LEFT JOIN tb_project tp ON tp.id = item.project_id
                WHERE tp.name = '$project'
                GROUP BY family_name)
                UNION 
                (SELECT family_name as name from tb_forge_foundation
                LEFT JOIN  tb_forge_item item  ON item.id = item_id
                LEFT JOIN tb_project tp ON tp.id = item.project_id
                WHERE tp.name = '$project'
                GROUP BY family_name)
                UNION 
                (SELECT family_name as name from tb_forge_foundation_updated
                LEFT JOIN  tb_forge_item item  ON item.id = item_id
                LEFT JOIN tb_project tp ON tp.id = item.project_id
                WHERE tp.name = '$project'
                GROUP BY family_name)";
      $data = DB::select($query);     
      return json_decode(json_encode($data),true);
    }

    public function GetTypeNamesByProject($project)
    {
      $query = "(SELECT type_name as name from tb_forge_column 
                LEFT JOIN  tb_forge_item item  ON item.id = item_id
                LEFT JOIN tb_project tp ON tp.id = item.project_id
                WHERE tp.name = '$project'
                GROUP BY type_name)
                UNION 
                (SELECT type_name as name from tb_forge_column_updated
                LEFT JOIN  tb_forge_item item  ON item.id = item_id
                LEFT JOIN tb_project tp ON tp.id = item.project_id
                WHERE tp.name = '$project'
                GROUP BY type_name)
                UNION 
                (SELECT type_name as name from tb_forge_beam
                LEFT JOIN  tb_forge_item item  ON item.id = item_id
                LEFT JOIN tb_project tp ON tp.id = item.project_id
                WHERE tp.name = '$project'
                GROUP BY type_name)
                UNION 
                (SELECT type_name as name from tb_forge_beam_updated
                LEFT JOIN  tb_forge_item item  ON item.id = item_id
                LEFT JOIN tb_project tp ON tp.id = item.project_id
                WHERE tp.name = '$project'
                GROUP BY type_name)
                UNION 
                (SELECT type_name as name from tb_forge_floor
                LEFT JOIN  tb_forge_item item  ON item.id = item_id
                LEFT JOIN tb_project tp ON tp.id = item.project_id
                WHERE tp.name = '$project'
                GROUP BY type_name)
                UNION 
                (SELECT type_name as name from tb_forge_floor_updated
                LEFT JOIN  tb_forge_item item  ON item.id = item_id
                LEFT JOIN tb_project tp ON tp.id = item.project_id
                WHERE tp.name = '$project'
                GROUP BY type_name)
                UNION 
                (SELECT type_name as name from tb_forge_wall
                LEFT JOIN  tb_forge_item item  ON item.id = item_id
                LEFT JOIN tb_project tp ON tp.id = item.project_id
                WHERE tp.name = '$project'
                GROUP BY type_name)
                UNION 
                (SELECT type_name as name from tb_forge_wall_updated
                LEFT JOIN  tb_forge_item item  ON item.id = item_id
                LEFT JOIN tb_project tp ON tp.id = item.project_id
                WHERE tp.name = '$project'
                GROUP BY type_name)
                UNION 
                (SELECT type_name as name from tb_forge_foundation
                LEFT JOIN  tb_forge_item item  ON item.id = item_id
                LEFT JOIN tb_project tp ON tp.id = item.project_id
                WHERE tp.name = '$project'
                GROUP BY type_name)
                UNION 
                (SELECT type_name as name from tb_forge_foundation_updated
                LEFT JOIN  tb_forge_item item  ON item.id = item_id
                LEFT JOIN tb_project tp ON tp.id = item.project_id
                WHERE tp.name = '$project'
                GROUP BY type_name)";
      $data = DB::select($query);     
      return json_decode(json_encode($data),true);
    }

    public function UpdateProjectAutoSaveFlag($updateProject,$backupProject){
      $projects = ($updateProject == "") ? "'"."ALL_UNCHECK"."'" : "'" . implode ( "', '", $updateProject ) . "'";//convert array to string with single code
      $backupProjects = ($backupProject == "") ? "'"."ALL_UNCHECK"."'"  : "'" . implode ( "', '", $backupProject ) . "'";
      $query = "UPDATE tb_project 
                SET auto_save_properties = (CASE 
                                            WHEN name IN ($projects) 
                                              THEN 1
                                              ELSE 0
                                          END)
                    ,auto_backup = (CASE 
                                    WHEN name IN ($backupProjects) 
                                      THEN 1
                                      ELSE 0
                                  END)";
      DB::update($query);

      return "success";
    }
    
    public function GetDataByVersion($version_number,$version_id,$item_id,$category_list,$material_list,$workset_list,$level_list,$familyName_list,$typeName_list,$typeName_filter){
      $query="";
      $condition = "";

      if($material_list != ""){
        $material_str = "'" . implode ( "', '", $material_list ) . "'";
        $condition .= " AND material_name IN ($material_str)";
      }
      if($workset_list != ""){
        $workset_str = "'" . implode ( "', '", $workset_list ) . "'";
        $condition .= " AND workset IN ($workset_str)";
      }
      if($level_list != ""){
        $level_str = "'" . implode ( "', '", $level_list ) . "'";
        $condition .= " AND level IN ($level_str)";
      }
      if($familyName_list != ""){
        $familyName_str = "'" . implode ( "', '", $familyName_list ) . "'";
        $condition .= " AND family_name IN ($familyName_str)";
      }
      if($typeName_list != ""){
        $typeName_str = "'" . implode ( "', '", $typeName_list ) . "'";
        $condition .= " AND type_name IN ($typeName_str)";
      }
      if($typeName_filter != ""){
        $condition .= " AND type_name LIKE BINARY '%$typeName_filter%'";
      }
      //print_r($category_list);exit;

      if($category_list == "" || in_array('column', $category_list)){//find given value is exist or not in array
        
        $query .= "(SELECT 
                  MAX(col.id)as id,
                  MAX(col.type_name)as type_name,
                  MAX(col.element_id)as element_id,
                  MAX(col.material_name)as material_name,
                  MAX(col.level)as level,
                  MAX(col.volume) as volume,
                  MAX(col.family_name)as family_name,
                  MAX(col.workset)as workset,
                  $version_number as version_number
              FROM
                  ((SELECT 
                      MAX(t1.id)as id,
                      MAX(t1.type_name)as type_name,
                      MAX(t1.element_id)as element_id,
                      MAX(t1.material_name)as material_name,
                      MAX(t1.level) as level,
                      MAX(t1.volume) as volume,
                      MAX(t1.family_name) as family_name,
                      MAX(t1.workset) as workset,
                      MAX(t1.version_number) as version_number
                  FROM tb_forge_column_updated as t1
                  WHERE t1.version_number <= $version_number AND t1.item_id = $item_id ".$condition."

                  GROUP BY t1.element_id)
                  UNION ALL 
                  (SELECT id,type_name,element_id,material_name,level,volume,family_name,workset,version_number
                    FROM tb_forge_column
                    WHERE version_number <= $version_number AND item_id = $item_id ".$condition.")) as col 
              GROUP BY col.element_id ORDER BY col.level)";

      }

      if($category_list == "" || in_array('beam', $category_list)){

        if($query != "") $query .= " UNION ALL ";        
        $query .= "(SELECT 
                MAX(beam.id)as id,
                MAX(beam.type_name)as type_name,
                MAX(beam.element_id)as element_id,
                MAX(beam.material_name)as material_name,
                MAX(beam.level)as level,
                MAX(beam.volume) as volume,
                MAX(beam.family_name)as family_name,
                MAX(beam.workset)as workset,
                $version_number as version_number
            FROM
                ((SELECT 
                    MAX(t1.id)as id,
                    MAX(t1.type_name)as type_name,
                    MAX(t1.element_id)as element_id,
                    MAX(t1.material_name)as material_name,
                    MAX(t1.level) as level,
                    MAX(t1.volume) as volume,
                    MAX(t1.family_name) as family_name,
                    MAX(t1.workset) as workset,
                    MAX(t1.version_number) as version_number
                FROM tb_forge_beam_updated as t1
                WHERE t1.version_number <= $version_number AND t1.item_id = $item_id ".$condition."

                GROUP BY t1.element_id)
                UNION ALL 
                (SELECT id,type_name,element_id,material_name,level,volume,family_name,workset,version_number
                  FROM tb_forge_beam
                  WHERE version_number <= $version_number AND item_id = $item_id ".$condition.")) as beam
            GROUP BY beam.element_id
            ORDER BY beam.level)";
      }

      if($category_list == "" || in_array('floor', $category_list)){
        if($query != "") $query .= " UNION ALL ";        
        $query .= "(SELECT 
                MAX(flr.id)as id,
                MAX(flr.type_name)as type_name,
                MAX(flr.element_id)as element_id,
                MAX(flr.material_name)as material_name,
                MAX(flr.level)as level,
                MAX(flr.volume) as volume,
                MAX(flr.family_name)as family_name,
                MAX(flr.workset)as workset,
                $version_number as version_number
            FROM
                ((SELECT 
                    MAX(t1.id)as id,
                    MAX(t1.type_name)as type_name,
                    MAX(t1.element_id)as element_id,
                    MAX(t1.material_name)as material_name,
                    MAX(t1.level) as level,
                    MAX(t1.volume) as volume,
                    MAX(t1.family_name) as family_name,
                    MAX(t1.workset) as workset,
                    MAX(t1.version_number) as version_number
                FROM tb_forge_floor_updated as t1
                WHERE t1.version_number <= $version_number AND t1.item_id = $item_id ".$condition."

                GROUP BY t1.element_id)
                UNION ALL 
                (SELECT id,type_name,element_id,material_name,level,volume,family_name,workset,version_number
                  FROM tb_forge_floor
                  WHERE version_number <= $version_number AND item_id = $item_id ".$condition.")) as flr
            GROUP BY flr.element_id
            ORDER BY flr.level)";
      }

      if($category_list == "" || in_array('wall', $category_list)){
        if($query != "") $query .= " UNION ALL ";        
        $query .= "(SELECT 
                MAX(wall.id)as id,
                MAX(wall.type_name)as type_name,
                MAX(wall.element_id)as element_id,
                MAX(wall.material_name)as material_name,
                MAX(wall.level)as level,
                MAX(wall.volume) as volume,
                MAX(wall.family_name)as family_name,
                MAX(wall.workset)as workset,
                $version_number as version_number
            FROM
                ((SELECT 
                    MAX(t1.id)as id,
                    MAX(t1.type_name)as type_name,
                    MAX(t1.element_id)as element_id,
                    MAX(t1.material_name)as material_name,
                    MAX(t1.level) as level,
                    MAX(t1.volume) as volume,
                    MAX(t1.family_name) as family_name,
                    MAX(t1.workset) as workset,
                    MAX(t1.version_number) as version_number
                FROM tb_forge_wall_updated as t1
                WHERE t1.version_number <= $version_number AND t1.item_id = $item_id ".$condition."

                GROUP BY t1.element_id)
                UNION ALL 
                (SELECT id,type_name,element_id,material_name,level,volume,family_name,workset,version_number
                  FROM tb_forge_wall
                  WHERE version_number <= $version_number AND item_id = $item_id ".$condition.")) as wall
            GROUP BY wall.element_id
            ORDER BY wall.level)";
      }

      if($category_list == "" || in_array('foundation', $category_list)){
        if($query != "") $query .= " UNION ALL ";        
        $query .= "(SELECT 
                MAX(fd.id)as id,
                MAX(fd.type_name)as type_name,
                MAX(fd.element_id)as element_id,
                MAX(fd.material_name)as material_name,
                MAX(fd.level)as level,
                MAX(fd.volume) as volume,
                MAX(fd.family_name)as family_name,
                MAX(fd.workset)as workset,
                $version_number as version_number
            FROM
                ((SELECT 
                    MAX(t1.id)as id,
                    MAX(t1.type_name)as type_name,
                    MAX(t1.element_id)as element_id,
                    MAX(t1.material_name)as material_name,
                    MAX(t1.level) as level,
                    MAX(t1.volume) as volume,
                    MAX(t1.family_name) as family_name,
                    MAX(t1.workset) as workset,
                    MAX(t1.version_number) as version_number
                FROM tb_forge_foundation_updated as t1
                WHERE t1.version_number <= $version_number AND t1.item_id = $item_id ".$condition."

                GROUP BY t1.element_id)
                UNION ALL 
                (SELECT id,type_name,element_id,material_name,level,volume,family_name,workset,version_number
                  FROM tb_forge_foundation
                  WHERE version_number <= $version_number AND item_id = $item_id ".$condition.")) as fd
            GROUP BY fd.element_id
            ORDER BY fd.level)";
      }
      
      
      
      
      $data = DB::select($query);     
      $kozo_data =  json_decode(json_encode($data),true);
      $room_data = array();

      // if($category_list == "" || in_array('room', $category_list)){
      if($category_list == ""){
        $room_condition="";
        if($workset_list != ""){
          $workset_str = "'" . implode ( "', '", $workset_list ) . "'";
          $room_condition .= " AND workset IN ($workset_str)";
        }
        if($level_list != ""){
          $level_str = "'" . implode ( "', '", $level_list ) . "'";
          $room_condition .= " AND level IN ($level_str)";
        }
       
        $room_query = "(SELECT 
                MAX(rm.id)as id,
                MAX(rm.room_name)as room_name,
                MAX(rm.element_id)as element_id,
                MAX(rm.level)as level,
                MAX(rm.shiage_tenjo)as shiage_tenjo,
                MAX(rm.tenjo_shitaji) as tenjo_shitaji,
                MAX(rm.mawaribuchi) as mawaribuchi,
                MAX(rm.shiage_kabe) as shiage_kabe,
                MAX(rm.kabe_shitaji) as kabe_shitaji,
                MAX(rm.habaki) as habaki,
                MAX(rm.shiage_yuka) as shiage_yuka,
                MAX(rm.yuka_shitaji) as yuka_shitaji,
                MAX(rm.shucho) as shucho,
                MAX(rm.menseki_kakikomi) as menseki_kakikomi,
                MAX(rm.santei_takasa) as santei_takasa,
                MAX(rm.heya_takasa) as heya_takasa,
                MAX(rm.menseki) as menseki,
                MAX(rm.workset) as workset,
                $version_number as version_number
            FROM
                ((SELECT *
                FROM tb_forge_room_updated as t1
                WHERE t1.version_number <= $version_number AND t1.item_id = $item_id ".$room_condition."

                GROUP BY t1.element_id)
                UNION ALL 
                (SELECT *
                  FROM tb_forge_room
                  WHERE version_number <= $version_number AND item_id = $item_id ".$room_condition.")) as rm
            GROUP BY rm.element_id
            ORDER BY rm.level)";
            
            $data = DB::select($room_query);     
            $room_data =  json_decode(json_encode($data),true);
      
      }
      
      
      return array("kozo_data"=>$kozo_data,"room_data"=>$room_data);
    }
    
    
    public function GetTekkinData($item_id,$category_list){
      $query = "SELECT * FROM tb_forge_column_tekkin WHERE item_id = $item_id";
      $data = DB::select($query);     
      return json_decode(json_encode($data),true);

    }
}
