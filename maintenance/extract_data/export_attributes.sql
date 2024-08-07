COPY (SELECT
    building_id,
    ref_toid,
    ref_osm_id,
    revision_id,
    location_name,
    location_number,
    location_street,
    location_line_two,
    location_town,
    location_postcode,
    location_latitude,
    location_longitude,
    is_domestic,
    use_building_origin,
    use_building_origin_text,
    use_building_current,
    use_building_current_text,
    basement_type,
    basement_percentage,
    basement_use,
    basement_use_source,
    ground_storey_use,
    ground_storey_use_source,
    upper_storeys_use,
    upper_storeys_use_source,
    use_number_residential_units,
    use_number_businesses,
    building_attachment_form,
    size_roof_shape,
    size_roof_shape_source,
    building_owner,
    building_owner_source,
    size_storeys_core,   
    size_storeys_attic,
    size_storeys_basement,
    size_height_apex,
    size_floor_area_ground,
    size_floor_area_total,
    size_width_frontage,
    construction_system_type,
    construction_system_type_source,
    construction_core_material,
    construction_secondary_materials,
    construction_roof_covering,
    building_status,
    building_status_source,
    last_renovation,
    last_renovation_source,
    --current_landuse_group,
    --current_landuse_order,
    --date_change_building_use,
    architectural_style,
    architectural_style_source,
    date_year,
    date_lower,
    date_upper,
    date_source,
    --date_source_detail,
    --date_link,
    facade_year,
    --facade_upper,
    --facade_lower,
    --facade_source,
    --facade_source_detail,
    --sust_breeam_rating,
    --sust_dec,
    --sust_retrofit_date,
    --planning_portal_link,
    --planning_in_conservation_area_id,
    --planning_in_conservation_area_url,
    --planning_in_conservation_area_source_url,
    --planning_conservation_area_name,
    --planning_in_list,
    --planning_list_id,
    --planning_list_cat,
    --planning_list_grade,
    --planning_heritage_at_risk_url,
    --planning_world_list_id,
    --planning_glher_url,
    --planning_in_apa_url,
    --planning_local_list_url,
    --planning_historic_area_assessment_url,
    community_type_worth_keeping_total,
    likes_total,
    thermal_stress_objective,
    thermal_stress_subjective,
    facade_window_percentage,
    direction_of_windows,
    heat_adaption_measure,
    roof_colour,
    roof_colour_type,
    facade_colour,
    terrain_connection_yesno,
    terrain_connection_difference,
    rain_flood_preventive_measures1,
    rain_flood_preventive_measures2,
    rain_flood_preventive_measures3,
    rain_flood_historic_incidents,
    heat_adaption_measure_source,
    terrain_connection_difference_source,
    rain_flood_preventive_measures_source,
    ref_land_parcel,
    ref_osm_type,
    ref_wikidata,
    ref_wikipedia,			

FROM buildings)
TO '/tmp/building_attributes.csv'
WITH CSV HEADER
