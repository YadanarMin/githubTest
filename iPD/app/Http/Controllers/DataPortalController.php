<?php

namespace App\Http\Controllers;
use App\Models\ForgeModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
class DataPortalController extends Controller 
{
    function index()
    {
        return view('dataPortal');
    }
    
    function ShowProjectOverview(){
        return view('projectOverview');
    }

    function ShowProjectSearchConsole(){
        return view('projectSearchConsole');
    }

}
