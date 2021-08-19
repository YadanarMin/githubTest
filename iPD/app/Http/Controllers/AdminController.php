<?php

namespace App\Http\Controllers;
use App\Models\LoginModel;
use App\Models\ForgeModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
class AdminController extends Controller
{
    function index()
    {
     $forge = new ForgeModel();
     $projects = $forge->GetProjects();   
     return view('admin')->with(["projects"=>$projects]);
    }

}
